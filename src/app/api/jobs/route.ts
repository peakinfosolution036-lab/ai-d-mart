import { NextRequest, NextResponse } from 'next/server';
import { jobs, generateId } from '@/lib/dynamodb';
import { ApiResponse } from '@/types';

// Browse jobs
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const source = searchParams.get('source'); // internal | external
        const category = searchParams.get('category');
        const location = searchParams.get('location');
        const type = searchParams.get('type');
        const isAdmin = searchParams.get('admin') === 'true';
        const search = searchParams.get('search');

        let allJobs = await jobs.getAll();

        // Users only see published jobs
        if (!isAdmin) {
            allJobs = allJobs.filter(j => j.status === 'open' || j.status === 'published');
        }

        if (source) {
            allJobs = allJobs.filter(j => j.source === source);
        }
        if (category) {
            allJobs = allJobs.filter(j => j.category?.toLowerCase() === category.toLowerCase());
        }
        if (location) {
            allJobs = allJobs.filter(j => j.location?.toLowerCase().includes(location.toLowerCase()));
        }
        if (type) {
            allJobs = allJobs.filter(j => j.type === type);
        }
        if (search) {
            const q = search.toLowerCase();
            allJobs = allJobs.filter(j =>
                j.title?.toLowerCase().includes(q) ||
                j.company?.toLowerCase().includes(q) ||
                j.description?.toLowerCase().includes(q) ||
                j.shortDescription?.toLowerCase().includes(q)
            );
        }

        return NextResponse.json<ApiResponse>({
            success: true,
            data: allJobs
        });
    } catch (error) {
        console.error('Browse jobs error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Failed to fetch jobs'
        }, { status: 500 });
    }
}

// Post job (Admin/Employer)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            title, company, category, description, shortDescription,
            type, salary, salaryRange, location, requirements,
            responsibilities, benefits, postedBy, source, status
        } = body;

        if (!title || !company || !type || !postedBy) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Required fields missing: title, company, type, postedBy'
            }, { status: 400 });
        }

        const jobId = generateId('JOB');
        const jobData = {
            title,
            company,
            category: category || 'General',
            description: description || '',
            shortDescription: shortDescription || description?.substring(0, 150) || '',
            type, // Full-time, Part-time, etc.
            salary: salary || '',
            salaryRange: salaryRange || salary || '',
            location: location || 'Remote',
            requirements: requirements || [],
            responsibilities: responsibilities || [],
            benefits: benefits || [],
            postedBy: postedBy,
            source: source || 'internal', // internal | external
            status: status || 'pending', // published, pending, draft, closed
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            applicationsCount: 0
        };

        const created = await jobs.create(jobId, jobData);

        if (created) {
            return NextResponse.json<ApiResponse>({
                success: true,
                message: 'Job post created successfully',
                data: { id: jobId, ...jobData }
            }, { status: 201 });
        } else {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Failed to create job post'
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Post job error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}

// Update job (Admin)
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Job ID is required'
            }, { status: 400 });
        }

        const updated = await jobs.update(id, updates);

        if (updated) {
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

// Delete job (Admin)
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Job ID is required'
            }, { status: 400 });
        }

        const deleted = await jobs.delete(id);

        if (deleted) {
            return NextResponse.json<ApiResponse>({
                success: true,
                message: 'Job deleted successfully'
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
