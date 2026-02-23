import { NextRequest, NextResponse } from 'next/server';
import { jobs, generateId, jobApplications } from '@/lib/dynamodb';
import { ApiResponse, JobItem, JobStats } from '@/types';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');

        if (action === 'stats') {
            const allJobs = await jobs.getAll();
            const allApps = await jobApplications.getByJob('ALL'); // This might need a specialized helper, but for now we'll filter
            const allApplications = await jobApplications.getByUser('ALL'); // Dummy call to getAll if I implement it

            // For now, let's just use what we have
            const realAllApps = await Promise.all(allJobs.map(j => jobApplications.getByJob(j.id)));
            const flatApps = realAllApps.flat();

            const stats: JobStats = {
                totalJobs: allJobs.length,
                activeJobs: allJobs.filter(j => j.status === 'open').length,
                totalApplications: flatApps.length,
                pendingApprovals: allJobs.filter(j => j.status === 'pending').length,
                hiredCount: flatApps.filter(a => a.status === 'accepted').length
            };

            return NextResponse.json<ApiResponse>({
                success: true,
                data: stats
            });
        }

        const allJobs = await jobs.getAll();
        return NextResponse.json<ApiResponse>({
            success: true,
            data: allJobs
        });
    } catch (error) {
        console.error('Get jobs error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Failed to fetch jobs'
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, company, location, salary, type, description, status } = body;

        if (!title || !company || !type || !salary) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Title, company, type, and salary are required'
            }, { status: 400 });
        }

        const jobId = generateId('JOB');
        const jobData = {
            title,
            company,
            location: location || 'Remote',
            salary,
            type, // Full-time / Part-time / Contract
            description: description || '',
            status: status || 'Publish',
            postedBy: 'ADMIN',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            applicationsCount: 0
        };

        const created = await jobs.create(jobId, jobData);

        if (created) {
            return NextResponse.json<ApiResponse>({
                success: true,
                data: { id: jobId, ...jobData }
            }, { status: 201 });
        } else {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Failed to create job'
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Create job error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Job ID is required'
            }, { status: 400 });
        }

        // Map status 'Publish'/'Close' to 'open'/'closed' for internal consistency if needed
        // but user asked for Publish / Close specifically. Let's keep what they asked.

        const success = await jobs.update(id, updates);

        if (success) {
            return NextResponse.json<ApiResponse>({
                success: true,
                message: 'Job updated successfully'
            });
        } else {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Failed to update job'
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Update job error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const jobId = searchParams.get('id');

        if (!jobId) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Job ID is required'
            }, { status: 400 });
        }

        const deleted = await jobs.delete(jobId);

        if (deleted) {
            return NextResponse.json<ApiResponse>({
                success: true,
                data: { message: 'Job deleted successfully' }
            });
        } else {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Failed to delete job'
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Delete job error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}