import { NextRequest, NextResponse } from 'next/server';
import { PutCommand, GetCommand, UpdateCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '@/lib/dynamodb';
import { v4 as uuidv4 } from 'uuid';

// GET - Fetch enquiries (admin) or services (public)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action') || 'list';

        if (action === 'services') {
            // Public: get available services
            const result = await docClient.send(new GetCommand({
                TableName: 'ai-d-mart-data',
                Key: { PK: 'CONFIG', SK: 'EVENT_SERVICES' }
            }));
            const services = result.Item?.services || [
                'Photography', 'Videography', 'Catering', 'Decoration',
                'DJ & Music', 'Venue Booking', 'Makeup & Styling',
                'Invitation Cards', 'Transportation', 'Accommodation'
            ];
            return NextResponse.json({ success: true, data: { services } });
        }

        // Admin: list all enquiries with filters
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        const result = await docClient.send(new QueryCommand({
            TableName: 'ai-d-mart-data',
            KeyConditionExpression: 'PK = :pk',
            ExpressionAttributeValues: { ':pk': 'EVENT_ENQUIRY' },
            ScanIndexForward: false
        }));

        let enquiries = result.Items || [];

        if (status) {
            enquiries = enquiries.filter((e: any) => e.status === status);
        }
        if (search) {
            const s = search.toLowerCase();
            enquiries = enquiries.filter((e: any) =>
                e.name?.toLowerCase().includes(s) ||
                e.mobile?.includes(s) ||
                e.email?.toLowerCase().includes(s) ||
                e.eventType?.toLowerCase().includes(s)
            );
        }

        // Sort by createdAt descending
        enquiries.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // Analytics
        const analytics = {
            total: enquiries.length,
            pending: enquiries.filter((e: any) => e.status === 'PENDING').length,
            inProgress: enquiries.filter((e: any) => e.status === 'IN_PROGRESS').length,
            completed: enquiries.filter((e: any) => e.status === 'COMPLETED').length,
            cancelled: enquiries.filter((e: any) => e.status === 'CANCELLED').length,
            byService: {} as Record<string, number>
        };

        enquiries.forEach((e: any) => {
            (e.services || []).forEach((s: string) => {
                analytics.byService[s] = (analytics.byService[s] || 0) + 1;
            });
        });

        return NextResponse.json({ success: true, data: { enquiries, analytics } });
    } catch (error) {
        console.error('Event enquiry GET error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch enquiries' }, { status: 500 });
    }
}

// POST - Submit enquiry (public, no auth), or admin actions
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action } = body;

        const timestamp = new Date().toISOString();

        if (action === 'submit_enquiry') {
            const { name, mobile, email, eventDate, eventType, services, notes, fileUrls } = body;

            if (!name || !mobile || !email) {
                return NextResponse.json({ success: false, error: 'Name, mobile, and email are required' }, { status: 400 });
            }

            // Validate mobile
            if (!/^[6-9]\d{9}$/.test(mobile)) {
                return NextResponse.json({ success: false, error: 'Please enter a valid 10-digit mobile number' }, { status: 400 });
            }

            // Validate email
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return NextResponse.json({ success: false, error: 'Please enter a valid email address' }, { status: 400 });
            }

            const enquiryId = uuidv4();

            const enquiry = {
                PK: 'EVENT_ENQUIRY',
                SK: `ENQ#${enquiryId}`,
                id: enquiryId,
                name, mobile, email,
                eventDate: eventDate || null,
                eventType: eventType || 'General',
                services: services || [],
                notes: notes || '',
                fileUrls: fileUrls || [],
                status: 'PENDING',
                assignedTo: null,
                createdAt: timestamp,
                updatedAt: timestamp
            };

            await docClient.send(new PutCommand({
                TableName: 'ai-d-mart-data',
                Item: enquiry
            }));

            // Send confirmation email via Resend
            try {
                const { sendEventEnquiryConfirmation } = await import('@/lib/email-resend');
                await sendEventEnquiryConfirmation({ name, email, enquiryId, eventType, eventDate, services });
            } catch (emailError) {
                console.error('Failed to send confirmation email:', emailError);
                // Don't fail the enquiry if email fails
            }

            return NextResponse.json({
                success: true,
                data: { enquiryId, message: 'Thank you! Your enquiry has been submitted successfully.' }
            });
        }

        if (action === 'update_status') {
            const { enquiryId, status: newStatus } = body;
            if (!enquiryId || !newStatus) {
                return NextResponse.json({ success: false, error: 'enquiryId and status required' }, { status: 400 });
            }

            await docClient.send(new UpdateCommand({
                TableName: 'ai-d-mart-data',
                Key: { PK: 'EVENT_ENQUIRY', SK: `ENQ#${enquiryId}` },
                UpdateExpression: 'SET #s = :status, updatedAt = :ts',
                ExpressionAttributeNames: { '#s': 'status' },
                ExpressionAttributeValues: { ':status': newStatus, ':ts': timestamp }
            }));

            return NextResponse.json({ success: true, message: `Enquiry status updated to ${newStatus}` });
        }

        if (action === 'assign') {
            const { enquiryId, assignedTo } = body;
            await docClient.send(new UpdateCommand({
                TableName: 'ai-d-mart-data',
                Key: { PK: 'EVENT_ENQUIRY', SK: `ENQ#${enquiryId}` },
                UpdateExpression: 'SET assignedTo = :assignee, #s = :status, updatedAt = :ts',
                ExpressionAttributeNames: { '#s': 'status' },
                ExpressionAttributeValues: { ':assignee': assignedTo, ':status': 'IN_PROGRESS', ':ts': timestamp }
            }));
            return NextResponse.json({ success: true, message: `Enquiry assigned to ${assignedTo}` });
        }

        if (action === 'update_services') {
            // Admin: update available services list
            const { services } = body;
            await docClient.send(new PutCommand({
                TableName: 'ai-d-mart-data',
                Item: { PK: 'CONFIG', SK: 'EVENT_SERVICES', services, updatedAt: timestamp }
            }));
            return NextResponse.json({ success: true, message: 'Services updated' });
        }

        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Event enquiry POST error:', error);
        return NextResponse.json({ success: false, error: 'Failed to process enquiry' }, { status: 500 });
    }
}
