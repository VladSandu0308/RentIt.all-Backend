// services/emailService.js - Serviciu nou pentru gestionarea email-urilor
var amqp = require('amqplib/callback_api');

class EmailService {
    static sendEmail(emailData, callback = null) {
        amqp.connect('amqp://licenta_rabbitmq:5672', function(error0, connection) {
            if (error0) {
                console.log('⚠️  RabbitMQ connection failed:', error0.message);
                console.log('📧 Email notification skipped - service unavailable');
                if (callback) callback(false, 'RabbitMQ connection failed');
                return;
            }

            connection.createChannel(function(error1, channel) {
                if (error1) {
                    console.log('⚠️  RabbitMQ channel creation failed:', error1.message);
                    if (callback) callback(false, 'Channel creation failed');
                    return;
                }

                var queue = 'queue';
                let message = JSON.stringify(emailData);

                channel.assertQueue(queue, { durable: true });
                channel.sendToQueue(queue, Buffer.from(message));
                console.log('✅ Email queued successfully to:', emailData.to);
                
                if (callback) callback(true, 'Email sent successfully');

                // Închide conexiunea după un timeout scurt
                setTimeout(() => {
                    connection.close();
                }, 500);
            });
        });
    }

    // Template-uri de email
    static templates = {
        newRequest: (hostEmail, locationTitle) => ({
            from: 'house_share@gmail.com',
            to: hostEmail,
            subject: `New request for location ${locationTitle}`,
            html: `
                <h2>🏠 New Booking Request</h2>
                <p>You have received a new request for your property <strong>${locationTitle}</strong>.</p>
                <p>Please log into your account to review and respond to this request.</p>
                <p>Thank you for using our platform!</p>
            `
        }),

        requestAccepted: (guestEmail, locationTitle) => ({
            from: 'house_share@gmail.com',
            to: guestEmail,
            subject: `Request Accepted: ${locationTitle}`,
            html: `
                <h2>🎉 Great News! Your Request Was Accepted</h2>
                <p>Your booking request for <strong>${locationTitle}</strong> has been accepted by the host!</p>
                <p><strong>Next Steps:</strong></p>
                <ol>
                    <li>Log into your account</li>
                    <li>Go to "Your Bookings"</li>
                    <li>Click "Pay Now" to complete your reservation</li>
                </ol>
                <p>Please complete payment within 24 hours to secure your booking.</p>
                <p>Thank you for using our platform!</p>
            `
        }),

        invoiceRequested: (hostEmail, locationTitle, companyName) => ({
            from: 'house_share@gmail.com',
            to: hostEmail,
            subject: `Invoice Request: ${locationTitle}`,
            html: `
                <h2>📋 Invoice Request Received</h2>
                <p>You have received a new invoice request for your property <strong>${locationTitle}</strong>.</p>
                <p><strong>Requesting Company:</strong> ${companyName}</p>
                <p>Please log into your host dashboard to generate and send the fiscal invoice.</p>
                <p>Thank you for using our platform!</p>
            `
        }),

        invoiceGenerated: (guestEmail, locationTitle, companyName) => ({
            from: 'house_share@gmail.com',
            to: guestEmail,
            subject: `Invoice Ready: ${locationTitle}`,
            html: `
                <h2>📄 Your Fiscal Invoice is Ready!</h2>
                <p>The fiscal invoice for your booking at <strong>${locationTitle}</strong> has been generated.</p>
                <p><strong>Company:</strong> ${companyName}</p>
                <p>You can now download your invoice from your bookings page.</p>
                <p>Thank you for using our platform!</p>
            `
        }),

        permitSubmitted: (ministerEmail, locationTitle, permitType) => ({
            from: 'house_share@gmail.com',
            to: ministerEmail,
            subject: `New Permit Application: ${permitType} for ${locationTitle}`,
            html: `
                <h2>📋 New Permit Application</h2>
                <p>A new permit application has been submitted:</p>
                <ul>
                    <li><strong>Property:</strong> ${locationTitle}</li>
                    <li><strong>Permit Type:</strong> ${permitType}</li>
                    <li><strong>Status:</strong> Pending Review</li>
                </ul>
                <p>Please log into the Minister Panel to review this application.</p>
            `
        }),

        permitReviewed: (hostEmail, locationTitle, permitType, status, permitNumber, rejectionReason) => ({
            from: 'house_share@gmail.com',
            to: hostEmail,
            subject: `Permit ${status}: ${permitType} for ${locationTitle}`,
            html: `
                <h2>📋 Permit Application ${status}</h2>
                <p>Your permit application has been reviewed:</p>
                <ul>
                    <li><strong>Property:</strong> ${locationTitle}</li>
                    <li><strong>Permit Type:</strong> ${permitType}</li>
                    <li><strong>Status:</strong> ${status}</li>
                    ${permitNumber ? `<li><strong>Permit Number:</strong> ${permitNumber}</li>` : ''}
                    ${rejectionReason ? `<li><strong>Rejection Reason:</strong> ${rejectionReason}</li>` : ''}
                </ul>
                ${status === 'approved' ? 
                    '<p>🎉 Congratulations! Your permit has been approved. You can now operate legally.</p>' :
                    '<p>❌ Unfortunately, your permit was not approved. Please address the issues and resubmit.</p>'
                }
            `
        }),


        paymentCompleted: (guestEmail, hostEmail, locationTitle, bookingDetails) => [
            // Email pentru guest
            {
                from: 'house_share@gmail.com',
                to: guestEmail,
                subject: `Payment Confirmed: ${locationTitle}`,
                html: `
                    <h2>🎉 Booking Confirmed!</h2>
                    <p>Your payment has been processed and your booking for <strong>${locationTitle}</strong> is now confirmed!</p>
                    <p><strong>Booking Details:</strong></p>
                    <ul>
                        <li>📅 Check-in: ${bookingDetails.checkIn}</li>
                        <li>📅 Check-out: ${bookingDetails.checkOut}</li>
                        <li>💰 Total paid: ${bookingDetails.totalAmount} RON</li>
                        <li>🏠 Host: ${bookingDetails.hostName} (${hostEmail})</li>
                        <li>📍 Address: ${bookingDetails.address}</li>
                    </ul>
                    <p>Have a wonderful stay! 🏡</p>
                `
            },
            // Email pentru host
            {
                from: 'house_share@gmail.com',
                to: hostEmail,
                subject: `Payment Received: ${locationTitle}`,
                html: `
                    <h2>💰 Payment Received!</h2>
                    <p>Great news! Payment has been completed for your property <strong>${locationTitle}</strong>.</p>
                    <p><strong>Booking Details:</strong></p>
                    <ul>
                        <li>👤 Guest: ${bookingDetails.guestName} (${guestEmail})</li>
                        <li>📞 Guest Phone: ${bookingDetails.guestPhone}</li>
                        <li>📅 Check-in: ${bookingDetails.checkIn}</li>
                        <li>📅 Check-out: ${bookingDetails.checkOut}</li>
                        <li>💵 Your earnings: ${bookingDetails.hostAmount} RON</li>
                        <li>🏛️ Government tax: ${bookingDetails.governmentTax} RON</li>
                        <li>🖥️ Platform fee: ${bookingDetails.platformFee} RON</li>
                    </ul>
                    <p>Please prepare to welcome your guest! 🎉</p>
                `
            }
        ]
    };

    // Metodă convenabilă pentru trimiterea template-urilor
    static sendTemplateEmail(templateName, ...args) {
        if (!this.templates[templateName]) {
            console.log(`❌ Email template '${templateName}' not found`);
            return;
        }

        const emailData = this.templates[templateName](...args);
        
        if (Array.isArray(emailData)) {
            // Trimite multiple email-uri
            emailData.forEach(email => this.sendEmail(email));
        } else {
            // Trimite un singur email
            this.sendEmail(emailData);
        }
    }
}

module.exports = EmailService;