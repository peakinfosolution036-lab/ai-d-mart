import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

// Initialize SES client
const sesClient = new SESClient({
    region: (process.env.APP_AWS_REGION || 'ap-south-1').trim(),
    credentials: {
        accessKeyId: (process.env.APP_AWS_ACCESS_KEY_ID || '').trim(),
        secretAccessKey: (process.env.APP_AWS_SECRET_ACCESS_KEY || '').trim(),
    },
});

interface SendEmailParams {
    to: string;
    subject: string;
    htmlBody: string;
    textBody?: string;
}

export async function sendEmail({ to, subject, htmlBody, textBody }: SendEmailParams) {
    try {
        const command = new SendEmailCommand({
            Source: process.env.SES_FROM_EMAIL || 'noreply@ai-d-mart.com',
            Destination: {
                ToAddresses: [to],
            },
            Message: {
                Subject: {
                    Data: subject,
                    Charset: 'UTF-8',
                },
                Body: {
                    Html: {
                        Data: htmlBody,
                        Charset: 'UTF-8',
                    },
                    ...(textBody && {
                        Text: {
                            Data: textBody,
                            Charset: 'UTF-8',
                        },
                    }),
                },
            },
        });

        const response = await sesClient.send(command);
        return { success: true, messageId: response.MessageId };
    } catch (error) {
        console.error('Error sending email:', error);
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
                <a href="#" class="footer-link">Contact Support</a>
                <a href="#" class="footer-link">View Dashboard</a>
                <a href="#" class="footer-link">FAQs</a>
            </div>
        </div>
    </div>
</body>
</html>
    `;

    const textBody = `
Hi ${userName},

Great news! Your event booking has been confirmed by our team.

BOOKING DETAILS:
- Event: ${eventTitle}
- Date: ${eventDate}
${eventTime ? `- Time: ${eventTime}` : ''}
${eventLocation ? `- Location: ${eventLocation}` : ''}
- Booking ID: ${bookingId}
- Status: CONFIRMED

What's next?
• Save this confirmation email for your records
• Arrive 15 minutes before the event start time
• Bring a valid ID for verification
• Check your dashboard for any updates

If you have any questions, please contact our support team.

Best regards,
AI D-Mart Team
    `;

    return sendEmail({
        to: userEmail,
        subject,
        htmlBody,
        textBody,
    });
}
