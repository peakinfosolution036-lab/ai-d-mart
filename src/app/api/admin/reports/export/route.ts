import { NextRequest, NextResponse } from 'next/server';
import { reports, getUsersByRole, jobs, events } from '@/lib/dynamodb';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'platform';
        const format = searchParams.get('format') || 'json';

        let data: any = null;
        let filename = 'report';

        switch (type) {
            case 'platform':
                data = await reports.getPlatformStats();
                filename = `platform-stats-${new Date().toISOString().split('T')[0]}`;
                break;

            case 'users':
                const [customers, admins] = await Promise.all([
                    getUsersByRole('CUSTOMER'),
                    getUsersByRole('ADMIN')
                ]);
                data = [...customers, ...admins];
                filename = `users-list-${new Date().toISOString().split('T')[0]}`;
                break;

            case 'jobs':
                data = await jobs.getAll();
                filename = `jobs-list-${new Date().toISOString().split('T')[0]}`;
                break;

            case 'events':
                data = await events.getAll();
                filename = `events-list-${new Date().toISOString().split('T')[0]}`;
                break;

            case 'top-businesses':
                const stats = await reports.getPlatformStats();
                data = stats?.topBusinesses || [];
                filename = `top-businesses-${new Date().toISOString().split('T')[0]}`;
                break;

            default:
                return NextResponse.json<ApiResponse>({
                    success: false,
                    error: 'Invalid report type'
                }, { status: 400 });
        }

        // Return data based on format
        if (format === 'json') {
            return NextResponse.json({
                success: true,
                data: {
                    reportType: type,
                    generatedAt: new Date().toISOString(),
                    totalRecords: Array.isArray(data) ? data.length : 1,
                    data
                }
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Disposition': `attachment; filename="${filename}.json"`
                }
            });
        } else if (format === 'csv') {
            // Convert to CSV
            const csv = convertToCSV(data, type);
            return new NextResponse(csv, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="${filename}.csv"`
                }
            });
        } else {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Unsupported format. Use json or csv'
            }, { status: 400 });
        }
    } catch (error) {
        console.error('Export report error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Failed to generate report'
        }, { status: 500 });
    }
}

function convertToCSV(data: any, type: string): string {
    if (!data || (Array.isArray(data) && data.length === 0)) {
        return 'No data available';
    }

    // Handle different data types
    if (type === 'platform') {
        // Platform stats - key-value format
        const rows = [
            ['Metric', 'Value'],
            ['Total Users', data.totalUsers || 0],
            ['Total Customers', data.totalCustomers || 0],
            ['Total Admins', data.totalAdmins || 0],
            ['Active Users', data.activeUsers || 0],
            ['Total Orders', data.totalOrders || 0],
            ['Total Revenue', data.totalRevenue || 0],
            ['Total Events', data.totalEvents || 0],
            ['Total Businesses', data.totalBusinesses || 0],
            ['Active Businesses', data.activeBusinesses || 0],
            ['Total Bookings', data.totalBookings || 0],
            ['Pending Verifications', data.pendingVerifications || 0]
        ];
        return rows.map(row => row.join(',')).join('\n');
    }

    // For array data
    if (!Array.isArray(data)) {
        data = [data];
    }

    // Get headers
    const headers: string[] = Array.from(
        new Set(data.flatMap((item: any) => Object.keys(item)))
    );

    // Create CSV
    const csvRows = [
        headers.join(','),
        ...data.map((row: any) =>
            headers.map((header) => {
                const value = row[header];
                if (value === null || value === undefined) return '';
                const stringValue = String(value);
                // Escape values with commas or quotes
                if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                    return `"${stringValue.replace(/"/g, '""')}"`;
                }
                return stringValue;
            }).join(',')
        )
    ];

    return csvRows.join('\n');
}
