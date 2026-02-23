import { NextRequest, NextResponse } from 'next/server';
import { jobApplications, jobs } from '@/lib/dynamodb';
import { ApiResponse } from '@/types';
import { sendJobApplicationStatusEmail } from '@/lib/email-resend';

export async function GET() {
    try {
        const apps = await jobApplications.getAll();
        return NextResponse.json<ApiResponse>({
            success: true,
            data: apps
        });
    } catch (error) {
        console.error('Get job applications error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Failed to fetch applications'
        }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'ID and status are required'
            }, { status: 400 });
        }

        // Update application status
        const success = await jobApplications.updateStatus(id, status);

        if (success) {
            // Send email notification for status changes
            try {
                // Get application details
                const application = await jobApplications.get(id);

                if (application && application.email) {
                    // Get job details
                    const job = application.jobId ? await jobs.get(application.jobId) : null;

                    // Send status update email
                    await sendJobApplicationStatusEmail({
                        userName: application.name || 'Applicant',
                        userEmail: application.email,
                        jobTitle: application.jobTitle || job?.title || 'Position',
                        companyName: job?.company || job?.businessName,
                        status: status,
                        applicationId: id,
                        jobLocation: job?.location,
                    });

                    console.log(`Status update email sent to ${application.email} for status: ${status}`);
                }
            } catch (emailError) {
                // Log email error but don't fail the request
                console.error('Failed to send status update email:', emailError);
            }

            return NextResponse.json<ApiResponse>({
                success: true,
                message: `Application marked as ${status}. Email notification sent.`
            });
        } else {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Failed to update application status'
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Update job application error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}
