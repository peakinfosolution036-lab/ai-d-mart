/**
 * Export utilities for generating reports in various formats
 * Supports: CSV, Excel (XLSX), and JSON
 */

export interface ExportData {
    title: string;
    data: any[];
    filename: string;
}

/**
 * Export data to CSV format
 */
export function exportToCSV(exportData: ExportData): void {
    const { data, filename } = exportData;

    if (!data || data.length === 0) {
        alert('No data to export');
        return;
    }

    // Get all unique keys from the data
    const headers = Array.from(
        new Set(data.flatMap(item => Object.keys(item)))
    );

    // Create CSV content
    const csvContent = [
        // Headers
        headers.join(','),
        // Data rows
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                // Handle values with commas, quotes, or newlines
                if (value === null || value === undefined) return '';
                const stringValue = String(value);
                if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                    return `"${stringValue.replace(/"/g, '""')}"`;
                }
                return stringValue;
            }).join(',')
        )
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `${filename}.csv`);
}

/**
 * Export data to Excel format (simplified - using CSV with .xlsx extension)
 * For full Excel support, use a library like xlsx or exceljs
 */
export function exportToExcel(exportData: ExportData): void {
    const { data, filename, title } = exportData;

    if (!data || data.length === 0) {
        alert('No data to export');
        return;
    }

    // Create a simple HTML table that Excel can import
    const headers = Array.from(
        new Set(data.flatMap(item => Object.keys(item)))
    );

    const htmlContent = `
        <html>
        <head>
            <meta charset="utf-8">
            <title>${title}</title>
            <style>
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #4CAF50; color: white; font-weight: bold; }
                tr:nth-child(even) { background-color: #f2f2f2; }
            </style>
        </head>
        <body>
            <h1>${title}</h1>
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <table>
                <thead>
                    <tr>
                        ${headers.map(h => `<th>${h}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${data.map(row => `
                        <tr>
                            ${headers.map(h => `<td>${row[h] ?? ''}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
        </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
    downloadBlob(blob, `${filename}.xls`);
}

/**
 * Export data to JSON format
 */
export function exportToJSON(exportData: ExportData): void {
    const { data, filename, title } = exportData;

    if (!data || data.length === 0) {
        alert('No data to export');
        return;
    }

    const jsonContent = JSON.stringify({
        title,
        exportedAt: new Date().toISOString(),
        totalRecords: data.length,
        data
    }, null, 2);

    const blob = new Blob([jsonContent], { type: 'application/json' });
    downloadBlob(blob, `${filename}.json`);
}

/**
 * Export platform statistics report
 */
export function exportPlatformReport(stats: any, format: 'csv' | 'excel' | 'json' = 'csv'): void {
    const reportData: any[] = [
        { Metric: 'Total Users', Value: stats.totalUsers || 0 },
        { Metric: 'Total Customers', Value: stats.totalCustomers || 0 },
        { Metric: 'Total Admins', Value: stats.totalAdmins || 0 },
        { Metric: 'Active Users', Value: stats.activeUsers || 0 },
        { Metric: 'Total Orders', Value: stats.totalOrders || 0 },
        { Metric: 'Total Revenue', Value: `₹${(stats.totalRevenue || 0).toLocaleString()}` },
        { Metric: 'Total Events', Value: stats.totalEvents || 0 },
        { Metric: 'Total Businesses', Value: stats.totalBusinesses || 0 },
        { Metric: 'Active Businesses', Value: stats.activeBusinesses || 0 },
        { Metric: 'Total Bookings', Value: stats.totalBookings || 0 },
        { Metric: 'Pending Verifications', Value: stats.pendingVerifications || 0 },
    ];

    const exportData: ExportData = {
        title: 'AI D-Mart Platform Statistics Report',
        data: reportData,
        filename: `platform-report-${new Date().toISOString().split('T')[0]}`
    };

    switch (format) {
        case 'csv':
            exportToCSV(exportData);
            break;
        case 'excel':
            exportToExcel(exportData);
            break;
        case 'json':
            exportToJSON(exportData);
            break;
        default:
            exportToCSV(exportData);
    }
}

/**
 * Export top businesses report
 */
export function exportTopBusinessesReport(businesses: any[], format: 'csv' | 'excel' | 'json' = 'csv'): void {
    const reportData = businesses.map((b, index) => ({
        Rank: index + 1,
        'Business Name': b.name,
        'Total Bookings': b.count || 0,
        'Total Revenue': `₹${(b.revenue || 0).toLocaleString()}`,
        'Business ID': b.id
    }));

    const exportData: ExportData = {
        title: 'Top Businesses by Revenue',
        data: reportData,
        filename: `top-businesses-${new Date().toISOString().split('T')[0]}`
    };

    switch (format) {
        case 'csv':
            exportToCSV(exportData);
            break;
        case 'excel':
            exportToExcel(exportData);
            break;
        case 'json':
            exportToJSON(exportData);
            break;
        default:
            exportToCSV(exportData);
    }
}

/**
 * Export comprehensive report with all data
 */
export function exportComprehensiveReport(stats: any, format: 'csv' | 'excel' | 'json' = 'json'): void {
    const reportData = {
        generatedAt: new Date().toISOString(),
        reportType: 'Comprehensive Platform Analytics',
        summary: {
            totalUsers: stats.totalUsers || 0,
            totalCustomers: stats.totalCustomers || 0,
            totalAdmins: stats.totalAdmins || 0,
            activeUsers: stats.activeUsers || 0,
            totalRevenue: stats.totalRevenue || 0,
            totalOrders: stats.totalOrders || 0,
            totalEvents: stats.totalEvents || 0,
            totalBusinesses: stats.totalBusinesses || 0,
            activeBusinesses: stats.activeBusinesses || 0,
            totalBookings: stats.totalBookings || 0,
        },
        topBusinesses: stats.topBusinesses || [],
        pendingVerifications: stats.pendingVerifications || 0
    };

    if (format === 'json') {
        const jsonContent = JSON.stringify(reportData, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        downloadBlob(blob, `comprehensive-report-${new Date().toISOString().split('T')[0]}.json`);
    } else {
        // Flatten for CSV/Excel
        const flatData = [reportData.summary];
        const exportData: ExportData = {
            title: 'Comprehensive Platform Report',
            data: flatData,
            filename: `comprehensive-report-${new Date().toISOString().split('T')[0]}`
        };

        if (format === 'csv') {
            exportToCSV(exportData);
        } else {
            exportToExcel(exportData);
        }
    }
}

/**
 * Helper function to download blob
 */
function downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

/**
 * Export users list
 */
export function exportUsersList(users: any[], format: 'csv' | 'excel' | 'json' = 'csv'): void {
    const reportData = users.map(user => ({
        'User ID': user.id,
        'Name': user.name || user.fullName,
        'Email': user.email,
        'Phone': user.phone || user.mobile || 'N/A',
        'Role': user.role,
        'Status': user.status,
        'KYC Verified': user.kycVerified ? 'Yes' : 'No',
        'Wallet Balance': `₹${(user.walletBalance || 0).toFixed(2)}`,
        'Created At': new Date(user.createdAt).toLocaleDateString()
    }));

    const exportData: ExportData = {
        title: 'Users List',
        data: reportData,
        filename: `users-list-${new Date().toISOString().split('T')[0]}`
    };

    switch (format) {
        case 'csv':
            exportToCSV(exportData);
            break;
        case 'excel':
            exportToExcel(exportData);
            break;
        case 'json':
            exportToJSON(exportData);
            break;
    }
}

/**
 * Export jobs list
 */
export function exportJobsList(jobs: any[], format: 'csv' | 'excel' | 'json' = 'csv'): void {
    const reportData = jobs.map(job => ({
        'Job ID': job.id,
        'Title': job.title,
        'Company': job.company,
        'Type': job.type,
        'Salary': job.salary,
        'Location': job.location,
        'Status': job.status,
        'Applications': job.applicationsCount || 0,
        'Posted By': job.postedBy,
        'Created At': new Date(job.createdAt).toLocaleDateString()
    }));

    const exportData: ExportData = {
        title: 'Jobs List',
        data: reportData,
        filename: `jobs-list-${new Date().toISOString().split('T')[0]}`
    };

    switch (format) {
        case 'csv':
            exportToCSV(exportData);
            break;
        case 'excel':
            exportToExcel(exportData);
            break;
        case 'json':
            exportToJSON(exportData);
            break;
    }
}

/**
 * Export events list
 */
export function exportEventsList(events: any[], format: 'csv' | 'excel' | 'json' = 'csv'): void {
    const reportData = events.map(event => ({
        'Event ID': event.id,
        'Title': event.title,
        'Category': event.category || 'N/A',
        'Location': event.location,
        'Date': event.date,
        'Price': `₹${event.price || 0}`,
        'Views': event.views || 0,
        'Bookings': event.bookings || 0,
        'Revenue': `₹${(event.revenue || 0).toLocaleString()}`,
        'Status': event.status,
        'Created At': new Date(event.createdAt).toLocaleDateString()
    }));

    const exportData: ExportData = {
        title: 'Events List',
        data: reportData,
        filename: `events-list-${new Date().toISOString().split('T')[0]}`
    };

    switch (format) {
        case 'csv':
            exportToCSV(exportData);
            break;
        case 'excel':
            exportToExcel(exportData);
            break;
        case 'json':
            exportToJSON(exportData);
            break;
    }
}

/**
 * Export reports analytics data
 */
export function exportReportsAnalytics(reportsData: any, format: 'csv' | 'excel' | 'json' = 'csv'): void {
    const reportData = [
        {
            'Report Category': 'Events',
            'Total': reportsData.events.total,
            'Active': reportsData.events.active,
            'Closed': reportsData.events.closed,
            'Status': `${reportsData.events.active} active, ${reportsData.events.closed} closed`
        },
        {
            'Report Category': 'Bookings',
            'Total': reportsData.bookings.total,
            'Confirmed': reportsData.bookings.confirmed,
            'Cancelled': reportsData.bookings.cancelled,
            'Status': `${reportsData.bookings.confirmed} confirmed, ${reportsData.bookings.cancelled} cancelled`
        },
        {
            'Report Category': 'Revenue',
            'Total': `₹${reportsData.revenue.total.toLocaleString()}`,
            'Today': `₹${reportsData.revenue.today.toLocaleString()}`,
            'This Month': `₹${reportsData.revenue.thisMonth.toLocaleString()}`,
            'Status': `Monthly: ₹${reportsData.revenue.thisMonth.toLocaleString()}`
        },
        {
            'Report Category': 'Customers',
            'Total': reportsData.customers.total,
            'Repeat Customers': reportsData.customers.repeat,
            'Retention Rate': `${(reportsData.customers.total > 0 ? (reportsData.customers.repeat / reportsData.customers.total * 100) : 0).toFixed(1)}%`,
            'Status': `${reportsData.customers.repeat} repeat customers`
        }
    ];

    const exportData: ExportData = {
        title: 'Platform Reports & Analytics',
        data: reportData,
        filename: `reports-analytics-${new Date().toISOString().split('T')[0]}`
    };

    switch (format) {
        case 'csv':
            exportToCSV(exportData);
            break;
        case 'excel':
            exportToExcel(exportData);
            break;
        case 'json':
            // For JSON, export the full structured data
            const jsonData = {
                generatedAt: new Date().toISOString(),
                reportType: 'Platform Reports & Analytics',
                data: {
                    events: reportsData.events,
                    bookings: reportsData.bookings,
                    revenue: reportsData.revenue,
                    customers: {
                        ...reportsData.customers,
                        retentionRate: (reportsData.customers.total > 0 ? (reportsData.customers.repeat / reportsData.customers.total * 100) : 0).toFixed(1) + '%'
                    }
                }
            };
            const jsonContent = JSON.stringify(jsonData, null, 2);
            const blob = new Blob([jsonContent], { type: 'application/json' });
            downloadBlob(blob, `reports-analytics-${new Date().toISOString().split('T')[0]}.json`);
            break;
    }
}
