import { NextRequest, NextResponse } from 'next/server';
import { jobApplications, generateId, jobs, users } from '@/lib/dynamodb';
import { ApiResponse } from '@/types';

// Get Applications (Admin Filters)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const applicantId = searchParams.get('applicantId');
        const jobId = searchParams.get('jobId');
        const status = searchParams.get('status');
        const jobType = searchParams.get('jobType');
        const location = searchParams.get('location');
        const company = searchParams.get('company');

        let apps: any[] = [];

        if (applicantId) {
            apps = await jobApplications.getByUser(applicantId);
        } else if (jobId) {
            apps = await jobApplications.getByJob(jobId);
        } else {
            // Admin view - get all and filter
            apps = await jobApplications.getAll();
        }

        // Apply filters
        if (status) {
            apps = apps.filter(a => a.status === status);
        }
        if (jobType) {
            apps = apps.filter(a => a.employmentType === jobType || a.jobType === jobType);
        }
        if (location) {
            apps = apps.filter(a => a.location?.toLowerCase().includes(location.toLowerCase()));
        }
        if (company) {
            apps = apps.filter(a => a.companyName?.toLowerCase().includes(company.toLowerCase()));
        }

        return NextResponse.json<ApiResponse>({
            success: true,
            data: apps
        });
    } catch (error) {
        console.error('Get applications error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}

// Submit Application
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            jobId, applicantId, name, email, mobile,
            documents, // { addressProof, identityProof, educationCertificate, selfie }
            locationData, // { lat, lng, address }
            employmentType,
            acceptedRules,
            jobTitle,
            companyName
        } = body;

        if (!jobId || !applicantId || !name || !email || !mobile || !acceptedRules) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Required fields missing'
            }, { status: 400 });
        }

        const applicationId = generateId('APP');
        const applicationData = {
            jobId,
            applicantId,
            name,
            email,
            mobile,
            documents: documents || {},
            locationData: locationData || {},
            employmentType,
            jobTitle: jobTitle || 'Unknown Job',
            companyName: companyName || 'Unknown Company',
            status: 'pending', // pending, in_progress, completed, rejected
            submissionDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            permanentId: null, // Issued on approval
            referringPerson: (await users.get(applicantId))?.referredBy || null
        };

        const created = await jobApplications.create(applicationId, applicationData);

        if (created) {
            return NextResponse.json<ApiResponse>({
                success: true,
                message: 'Your application has been received and is under review.',
                data: { id: applicationId, ...applicationData }
            }, { status: 201 });
        } else {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Failed to submit application'
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Submit application error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}

// Update Status & Issue ID
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, status, permanentId, notes } = body;

        if (!id || !status) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Application ID and status are required'
            }, { status: 400 });
        }

        const updates: any = { status, updatedAt: new Date().toISOString() };
        if (permanentId) updates.permanentId = permanentId;
        if (notes) updates.adminNotes = notes;

        const updated = await jobApplications.updateStatus(id, status);

        // If we have extra updates like permanentId or notes, we need a custom update
        if (permanentId || notes) {
            const { updateDataItem } = await import('@/lib/dynamodb');
            await updateDataItem('job_application', id, updates);
        }

        if (updated) {
            // If approved and permanentId issued, we might want to update user profile
            if (status === 'completed' && permanentId) {
                const app = await jobApplications.get(id);
                if (app && app.applicantId) {
                    await users.update(app.applicantId, {
                        permanentId: permanentId,
                        jobStatus: 'employed'
                    });
                }
            }

            return NextResponse.json<ApiResponse>({
                success: true,
                message: `Application status updated to ${status}`
            });
        } else {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Failed to update application status'
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Update application error:', error);
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}
