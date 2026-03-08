import { Resend } from 'resend';

let resendClient: Resend | null = null;

function getResendClient() {
    if (!resendClient) {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            return null;
        }
        resendClient = new Resend(apiKey);
    }
    return resendClient;
}


interface SendEmailParams {
    to: string;
    subject: string;
    htmlBody: string;
    attachments?: { filename: string; content: string }[];
}

export async function sendEmail({ to, subject, htmlBody, attachments }: SendEmailParams) {
    try {
        // In development/testing with Resend free tier, override recipient
        // Resend free tier only allows sending to your verified email
        const recipient = process.env.RESEND_TEST_EMAIL || to;

        // Add note to email if recipient was overridden
        let finalHtml = htmlBody;
        if (recipient !== to) {
            finalHtml = `
                <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 20px; font-family: sans-serif;">
                    <strong>⚠️ Testing Mode:</strong> This email was originally intended for <strong>${to}</strong> but was redirected to your verified email for testing purposes.
                </div>
                ${htmlBody}
            `;
        }

        const client = getResendClient();
        if (!client) {
            console.error('Failed to send email: Resend client not initialized (check RESEND_API_KEY)');
            return { success: false, error: 'Email service not configured' };
        }

        const data = await client.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
            to: [recipient],
            subject: `[TEST] ${subject}`,
            html: finalHtml,
            attachments: attachments,
        });

        console.log('Email sent successfully via Resend:', data);
        console.log(`Original recipient: ${to}, Actual recipient: ${recipient}`);
        return { success: true, messageId: data.data?.id || 'unknown' };
    } catch (error) {
        console.error('Error sending email via Resend:', error);
        return { success: false, error: String(error) };
    }
}

interface BookingConfirmationEmailParams {
    userName: string;
    userEmail: string;
    eventTitle: string;
    eventDate: string;
    eventTime?: string;
    eventLocation?: string;
    bookingId: string;
}

export async function sendBookingConfirmationEmail({
    userName,
    userEmail,
    eventTitle,
    eventDate,
    eventTime,
    eventLocation,
    bookingId,
}: BookingConfirmationEmailParams) {
    const subject = `Event Booking Confirmed - ${eventTitle}`;

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 20px; }
        .message { color: #475569; margin-bottom: 30px; line-height: 1.8; }
        .details-box { background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 8px; }
        .detail-item { margin: 12px 0; color: #334155; }
        .detail-label { font-weight: 600; color: #1e293b; display: inline-block; min-width: 120px; }
        .detail-value { color: #475569; }
        .status-badge { display: inline-block; background-color: #10b981; color: #ffffff; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 14px; margin: 20px 0; }
        .footer { background-color: #f8fafc; padding: 30px; text-align: center; color: #64748b; font-size: 14px; border-top: 1px solid #e2e8f0; }
        .footer-links { margin-top: 15px; }
        .footer-link { color: #3b82f6; text-decoration: none; margin: 0 10px; }
        .footer-link:hover { text-decoration: underline; }
        .divider { height: 1px; background-color: #e2e8f0; margin: 30px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Booking Confirmed!</h1>
        </div>

        <div class="content">
            <div class="greeting">Hi ${userName},</div>

            <div class="message">
                Great news! Your event booking has been confirmed by our team. We're excited to have you join us!
            </div>

            <div style="text-align: center;">
                <span class="status-badge">✓ CONFIRMED</span>
            </div>

            <div class="details-box">
                <div style="font-weight: 700; color: #1e293b; margin-bottom: 15px; font-size: 16px;">📋 Booking Details</div>

                <div class="detail-item">
                    <span class="detail-label">Event:</span>
                    <span class="detail-value">${eventTitle}</span>
                </div>

                <div class="detail-item">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">${eventDate}</span>
                </div>

                ${eventTime ? `
                <div class="detail-item">
                    <span class="detail-label">Time:</span>
                    <span class="detail-value">${eventTime}</span>
                </div>
                ` : ''}

                ${eventLocation ? `
                <div class="detail-item">
                    <span class="detail-label">Location:</span>
                    <span class="detail-value">${eventLocation}</span>
                </div>
                ` : ''}

                <div class="detail-item">
                    <span class="detail-label">Booking ID:</span>
                    <span class="detail-value">${bookingId}</span>
                </div>
            </div>

            <div class="message">
                <strong>What's next?</strong><br>
                • Save this confirmation email for your records<br>
                • Arrive 15 minutes before the event start time<br>
                • Bring a valid ID for verification<br>
                • Check your dashboard for any updates
            </div>

            <div class="divider"></div>

            <div class="message" style="color: #64748b; font-size: 14px;">
                If you have any questions or need to make changes to your booking, please contact our support team or visit your dashboard.
            </div>
        </div>

        <div class="footer">
            <div>© ${new Date().getFullYear()} AI D-Mart. All rights reserved.</div>
            <div class="footer-links">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" class="footer-link">Contact Support</a>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="footer-link">View Dashboard</a>
            </div>
        </div>
    </div>
</body>
</html>
    `;

    return sendEmail({
        to: userEmail,
        subject,
        htmlBody,
    });
}

interface JobApplicationStatusEmailParams {
    userName: string;
    userEmail: string;
    jobTitle: string;
    companyName?: string;
    status: string; // 'Shortlisted', 'Hired', 'Rejected'
    applicationId: string;
    jobLocation?: string;
}

export async function sendJobApplicationStatusEmail({
    userName,
    userEmail,
    jobTitle,
    companyName,
    status,
    applicationId,
    jobLocation,
}: JobApplicationStatusEmailParams) {
    const statusConfig = {
        'Shortlisted': {
            emoji: '🎯',
            color: '#3b82f6',
            title: 'Application Shortlisted!',
            message: 'Great news! Your application has been shortlisted. The employer will contact you soon for the next steps.',
            badge: 'SHORTLISTED'
        },
        'Hired': {
            emoji: '🎉',
            color: '#10b981',
            title: 'Congratulations! You\'re Hired!',
            message: 'Excellent news! You have been selected for this position. The employer will reach out to you shortly with further details.',
            badge: 'HIRED'
        },
        'Rejected': {
            emoji: '📋',
            color: '#64748b',
            title: 'Application Update',
            message: 'Thank you for your interest in this position. Unfortunately, we have decided to move forward with other candidates at this time. We encourage you to apply for other opportunities.',
            badge: 'NOT SELECTED'
        }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['Shortlisted'];
    const subject = `Job Application Update: ${jobTitle}`;

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, ${config.color} 0%, ${config.color}dd 100%); padding: 40px 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 20px; }
        .message { color: #475569; margin-bottom: 30px; line-height: 1.8; }
        .details-box { background-color: #f8fafc; border-left: 4px solid ${config.color}; padding: 20px; margin: 30px 0; border-radius: 8px; }
        .detail-item { margin: 12px 0; color: #334155; }
        .detail-label { font-weight: 600; color: #1e293b; display: inline-block; min-width: 140px; }
        .detail-value { color: #475569; }
        .status-badge { display: inline-block; background-color: ${config.color}; color: #ffffff; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 14px; margin: 20px 0; }
        .footer { background-color: #f8fafc; padding: 30px; text-align: center; color: #64748b; font-size: 14px; border-top: 1px solid #e2e8f0; }
        .footer-links { margin-top: 15px; }
        .footer-link { color: #3b82f6; text-decoration: none; margin: 0 10px; }
        .footer-link:hover { text-decoration: underline; }
        .divider { height: 1px; background-color: #e2e8f0; margin: 30px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${config.emoji} ${config.title}</h1>
        </div>

        <div class="content">
            <div class="greeting">Hi ${userName},</div>

            <div class="message">
                ${config.message}
            </div>

            <div style="text-align: center;">
                <span class="status-badge">${config.badge}</span>
            </div>

            <div class="details-box">
                <div style="font-weight: 700; color: #1e293b; margin-bottom: 15px; font-size: 16px;">📋 Application Details</div>

                <div class="detail-item">
                    <span class="detail-label">Job Position:</span>
                    <span class="detail-value">${jobTitle}</span>
                </div>

                ${companyName ? `
                <div class="detail-item">
                    <span class="detail-label">Company:</span>
                    <span class="detail-value">${companyName}</span>
                </div>
                ` : ''}

                ${jobLocation ? `
                <div class="detail-item">
                    <span class="detail-label">Location:</span>
                    <span class="detail-value">${jobLocation}</span>
                </div>
                ` : ''}

                <div class="detail-item">
                    <span class="detail-label">Application ID:</span>
                    <span class="detail-value">${applicationId}</span>
                </div>

                <div class="detail-item">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value" style="font-weight: 600; color: ${config.color};">${status}</span>
                </div>
            </div>

            ${status === 'Shortlisted' || status === 'Hired' ? `
            <div class="message">
                <strong>What's next?</strong><br>
                • Keep your phone and email accessible<br>
                • The employer will contact you within 2-3 business days<br>
                ${status === 'Shortlisted' ? '• Prepare for the interview by reviewing the job requirements<br>' : ''}
                ${status === 'Hired' ? '• Prepare your documents for onboarding<br>' : ''}
                • Check your dashboard for updates
            </div>
            ` : `
            <div class="message">
                <strong>Keep exploring opportunities:</strong><br>
                • Browse other job openings on our platform<br>
                • Update your profile to increase visibility<br>
                • Don't get discouraged - the right opportunity is waiting!
            </div>
            `}

            <div class="divider"></div>

            <div class="message" style="color: #64748b; font-size: 14px;">
                If you have any questions about your application, please feel free to contact us or check your dashboard for more details.
            </div>
        </div>

        <div class="footer">
            <div>© ${new Date().getFullYear()} AI D-Mart. All rights reserved.</div>
            <div class="footer-links">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" class="footer-link">Browse Jobs</a>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="footer-link">View Dashboard</a>
            </div>
        </div>
    </div>
</body>
</html>
    `;

    return sendEmail({
        to: userEmail,
        subject,
        htmlBody,
    });
}

// Event Enquiry Confirmation Email
interface EventEnquiryConfirmationParams {
    name: string;
    email: string;
    enquiryId: string;
    eventType?: string;
    eventDate?: string;
    services?: string[];
}

export async function sendEventEnquiryConfirmation({
    name, email, enquiryId, eventType, eventDate, services
}: EventEnquiryConfirmationParams) {
    const subject = `Event Enquiry Received - ${enquiryId.slice(0, 8).toUpperCase()}`;
    const servicesList = (services || []).map(s => `<li>${s}</li>`).join('');

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: #fff; }
        .header { background: linear-gradient(135deg, #00703C 0%, #10b981 100%); padding: 40px 30px; text-align: center; }
        .header h1 { color: #fff; margin: 0; font-size: 24px; font-weight: 700; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 20px; }
        .message { color: #475569; margin-bottom: 20px; line-height: 1.8; }
        .details-box { background: #f8fafc; border-left: 4px solid #00703C; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .detail-item { margin: 10px 0; color: #334155; }
        .detail-label { font-weight: 600; color: #1e293b; display: inline-block; min-width: 120px; }
        .status-badge { display: inline-block; background: #f59e0b; color: #fff; padding: 6px 14px; border-radius: 20px; font-weight: 600; font-size: 13px; }
        .footer { background: #f8fafc; padding: 30px; text-align: center; color: #64748b; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✨ Thank You for Your Enquiry!</h1>
        </div>
        <div class="content">
            <div class="greeting">Hi ${name},</div>
            <div class="message">We have received your event enquiry. Our team will review it and get back to you within 24 hours.</div>
            <div style="text-align:center;margin:20px 0"><span class="status-badge">⏳ PENDING REVIEW</span></div>
            <div class="details-box">
                <div style="font-weight:700;color:#1e293b;margin-bottom:15px">📋 Enquiry Details</div>
                <div class="detail-item"><span class="detail-label">Enquiry ID:</span> ${enquiryId.slice(0, 8).toUpperCase()}</div>
                ${eventType ? `<div class="detail-item"><span class="detail-label">Event Type:</span> ${eventType}</div>` : ''}
                ${eventDate ? `<div class="detail-item"><span class="detail-label">Event Date:</span> ${eventDate}</div>` : ''}
                ${servicesList ? `<div class="detail-item"><span class="detail-label">Services:</span><ul style="margin:5px 0;padding-left:20px">${servicesList}</ul></div>` : ''}
            </div>
            <div class="message" style="font-size:14px;color:#64748b">If you have any questions, please reply to this email or contact our team.</div>
        </div>
        <div class="footer">© ${new Date().getFullYear()} AI D-Mart. All rights reserved.</div>
    </div>
</body>
</html>
    `;

    return sendEmail({ to: email, subject, htmlBody });
}

// Lucky Draw Confirmation Email
export interface LuckyDrawConfirmationParams {
    name: string;
    email: string;
    mobile: string;
    luckyNumbers: number[];
    bookingId: string;
    photoDataUrl?: string;
}

export async function sendLuckyDrawConfirmationEmail({
    name, email, mobile, luckyNumbers, bookingId, photoDataUrl
}: LuckyDrawConfirmationParams) {
    const subject = `🎉 Lucky Draw Ticket Confirmation - ${bookingId.slice(0, 8).toUpperCase()}`;
    const numbersList = luckyNumbers.join(', ');

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: #fff; }
        .header { background: linear-gradient(135deg, #FFD700 0%, #F59E0B 100%); padding: 40px 30px; text-align: center; color: #00703C; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 900; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 20px; }
        .details-box { background: #E5F6EB; border-left: 4px solid #00703C; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .detail-item { margin: 10px 0; color: #00703C; }
        .detail-label { font-weight: 800; display: inline-block; min-width: 120px; text-transform: uppercase; font-size: 12px; }
        .footer { background: #00703C; padding: 30px; text-align: center; color: #fff; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 TICKET CONFIRMED!</h1>
        </div>
        <div class="content">
            <div class="greeting">Hi ${name},</div>
            <p>Your Lucky Draw ticket has been successfully booked!</p>
            <div class="details-box">
                <div class="detail-item"><span class="detail-label">Name:</span> <strong>${name}</strong></div>
                <div class="detail-item"><span class="detail-label">Mobile:</span> <strong>${mobile || 'Not provided'}</strong></div>
                <div class="detail-item"><span class="detail-label">Tickets:</span> <strong>${luckyNumbers.length}</strong></div>
                <div class="detail-item"><span class="detail-label">Lucky Number(s):</span> <strong style="font-size: 18px; color: #D32F2F;">${numbersList}</strong></div>
                <div class="detail-item"><span class="detail-label">Booking ID:</span> ${bookingId}</div>
                <div class="detail-item"><span class="detail-label">Payment:</span> <strong style="color: #00703C;">CONFIRMED ✅</strong></div>
            </div>
            <p>Keep your fingers crossed! We will contact you if you win.</p>
        </div>
        <div class="footer">© ${new Date().getFullYear()} AICLUB BIG WINNER. All rights reserved.</div>
    </div>
</body>
</html>
    `;

    let attachments = [];
    if (photoDataUrl && photoDataUrl.includes('base64,')) {
        // extract base64 string
        const base64Data = photoDataUrl.split('base64,')[1];
        if (base64Data) {
            attachments.push({
                filename: 'participant-photo.jpg',
                content: base64Data
            });
        }
    }

    return sendEmail({ to: email, subject, htmlBody, attachments });
}


export interface WelcomeEmailParams {
    name: string;
    email: string;
}

export async function sendWelcomeEmail({ name, email }: WelcomeEmailParams) {
    const subject = `Welcome to AI D-Mart! 🎉 Complete Your Profile to Start Earning`;

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: #fff; }
        .header { background: linear-gradient(135deg, #00703C 0%, #009951 100%); padding: 40px 30px; text-align: center; color: #fff; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 20px; }
        .feature-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; margin: 20px 0; border-radius: 12px; }
        .feature-title { font-weight: 700; color: #00703C; font-size: 16px; margin-bottom: 8px; }
        .footer { background: #1e293b; padding: 30px; text-align: center; color: #94a3b8; font-size: 13px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0;">Welcome to AI D-Mart! 🚀</h1>
        </div>
        <div class="content">
            <div class="greeting">Hi ${name},</div>
            <p>We are thrilled to have you! Your account is created.</p>
            
            <div class="feature-box">
                <div class="feature-title">💳 Digital Wallet</div>
                <p style="margin:0;font-size:14px;color:#475569;">Track your funds and easily pay.</p>
            </div>
            
            <div class="feature-box">
                <div class="feature-title">🍀 Weekly Lucky Draws</div>
                <p style="margin:0;font-size:14px;color:#475569;">Participate to win massive prizes.</p>
            </div>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} AI D-Mart. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;

    return sendEmail({ to: email, subject, htmlBody });
}
