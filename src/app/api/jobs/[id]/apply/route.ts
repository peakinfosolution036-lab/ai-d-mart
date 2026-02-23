import { NextRequest, NextResponse } from 'next/server';
import { jobs, jobApplications, generateId } from '@/lib/dynamodb';
import { ApiResponse, JobApplication } from '@/types';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const jobId = params.id;
        const body = await request.json();
        const { applicantId, applicantName, resumeUrl, notes } = body;

        if (!applicantId || !applicantName || !resumeUrl) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Applicant details and resume are required'
            }, { status: 400 });
        }

        // Check if job exists and is open
        const job = await jobs.get(jobId);
        if (!job || (job.status !== 'open' && job.status !== 'Publish')) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Job not found or no longer accepting applications'
            }, { status: 404 });
        }

        // Check if already applied
        const existingApps = await jobApplications.getByUser(applicantId);
        if (existingApps.some(a => a.jobId === jobId)) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'You have already applied for this job'
            }, { status: 400 });
        }

        const applicationId = generateId('APP');
        const applicationData: JobApplication = {
            id: applicationId,
            jobId,
            jobTitle: job.title,
            company: job.company,
            applicantId,
            applicantName,
            status: 'pending',
            resumeUrl,
            notes: notes || '',
            appliedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const created = await jobApplications.create(applicationId, applicationData);

        if (created) {
            return NextResponse.json<ApiResponse>({
                success: true,
                message: 'Application submitted successfully',
                data: applicationData
            }, { status: 201 });
        } else {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Failed to submit application'
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Apply job error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}
