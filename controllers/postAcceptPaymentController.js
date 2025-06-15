// controllers/postAcceptPaymentController.js
const { validationResult } = require('express-validator');
const stripe = require('../services/stripe');
const paymentModel = require('../models/PaymentModel');
const connectionModel = require('../models/ConnectionModel');
const locationModel = require('../models/LocationModel');
const userModel = require('../models/UserModel');
const EmailService = require('../services/emailService');
const ReceiptService = require('../services/receiptService');
var amqp = require('amqplib/callback_api');

// Inițiere plată pentru o rezervare deja acceptată
exports.initiatePaymentForAcceptedBooking = async (req, res, next) => {
    console.log("Enter initiate payment for accepted booking");
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    try {
        const { connection_id } = req.body;

        // Găsește conexiunea
        const connection = await connectionModel.findById(connection_id);
        if (!connection) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Verifică că booking-ul a fost acceptat dar nu plătit
        if (!connection.status.includes("accepted") || connection.completed) {
            return res.status(400).json({ 
                message: "Booking is not in the correct state for payment",
                current_status: connection.status 
            });
        }

        // Găsește locația și calculează costul
        const location = await locationModel.findById(connection.location_id);
        if (!location) {
            return res.status(404).json({ message: "Location not found" });
        }

        const startDate = new Date(connection.from);
        const endDate = new Date(connection.to);
        const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        const totalAmount = nights * location.price;

        // Găsește host-ul
        const host = await userModel.find({ email: location.host_email });
        if (!host.length) {
            return res.status(404).json({ message: "Host not found" });
        }

        // Calculează comisioanele
        const commissionRate = 0.10; // 10%
        const taxRate = 0.05; // 5%
        const platformCommission = Math.round(totalAmount * commissionRate);
        const governmentTax = Math.round(totalAmount * taxRate);
        const hostAmount = totalAmount - platformCommission - governmentTax;

        // Verifică dacă există deja un Payment Intent pentru această conexiune
        let existingPayment = await paymentModel.findOne({ 
            connection_id: connection_id,
            status: { $in: ['pending', 'requires_payment_method'] }
        });

        let paymentIntent;
        let payment;

        if (existingPayment) {
            // Actualizează Payment Intent existent
            paymentIntent = await stripe.paymentIntents.update(existingPayment.stripe_payment_intent_id, {
                amount: totalAmount * 100,
                metadata: {
                    connection_id: connection_id,
                    user_id: connection.user_id,
                    host_id: host[0]._id.toString(),
                    location_id: connection.location_id,
                    location_title: location.title,
                    nights: nights.toString()
                }
            });

            // Actualizează payment în DB
            payment = await paymentModel.findByIdAndUpdate(
                existingPayment._id,
                {
                    total_amount: totalAmount,
                    host_amount: hostAmount,
                    platform_commission: platformCommission,
                    government_tax: governmentTax,
                    nights: nights,
                    updated_at: new Date()
                },
                { new: true }
            );
        } else {
            // Creează Payment Intent nou
            paymentIntent = await stripe.paymentIntents.create({
                amount: totalAmount * 100,
                currency: 'ron',
                metadata: {
                    connection_id: connection_id,
                    user_id: connection.user_id,
                    host_id: host[0]._id.toString(),
                    location_id: connection.location_id,
                    location_title: location.title,
                    nights: nights.toString()
                }
            });

            // Salvează payment nou în DB
            payment = new paymentModel({
                connection_id: connection_id,
                user_id: connection.user_id,
                host_id: host[0]._id,
                location_id: connection.location_id,
                stripe_payment_intent_id: paymentIntent.id,
                total_amount: totalAmount,
                host_amount: hostAmount,
                platform_commission: platformCommission,
                government_tax: governmentTax,
                commission_rate: commissionRate,
                tax_rate: taxRate,
                nights: nights,
                status: 'pending'
            });
            await payment.save();
        }

        // Actualizează conexiunea cu payment_id și noul status
        await connectionModel.findByIdAndUpdate(
            connection_id,
            { 
                payment_id: payment._id,
                status: "Accepted - Payment in progress",
                total_amount: totalAmount
            }
        );

        return res.status(200).json({
            message: "Payment intent created for accepted booking",
            client_secret: paymentIntent.client_secret,
            payment_id: payment._id,
            booking_details: {
                location_title: location.title,
                location_address: location.location,
                check_in: connection.from,
                check_out: connection.to,
                nights: nights
            },
            cost_breakdown: {
                base_cost: totalAmount,
                host_amount: hostAmount,
                platform_commission: platformCommission,
                government_tax: governmentTax,
                total: totalAmount
            }
        });

    } catch (err) {
        console.error('Initiate payment error:', err);
        next(err);
    }
};

// Finalizare plată pentru booking acceptat
exports.completePaymentForAcceptedBooking = async (req, res, next) => {
    console.log("Enter complete payment for accepted booking");
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    try {
        const { payment_intent_id, status } = req.body;

        // Găsește payment-ul
        const payment = await paymentModel.findOneAndUpdate(
            { stripe_payment_intent_id: payment_intent_id },
            { 
                status: status,
                updated_at: new Date()
            },
            { new: true }
        );

        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        // Găsește conexiunea
        const connection = await connectionModel.findById(payment.connection_id);
        
        if (status === 'succeeded') {
            // 1. Actualizează conexiunea ca fiind completă
            await connectionModel.findByIdAndUpdate(
                payment.connection_id,
                { 
                    status: "Payment completed - Booking confirmed",
                    completed: true
                },
                { new: true }
            );

            // 2. ACUM adăugăm datele ca indisponibile
            await locationModel.findByIdAndUpdate(
                payment.location_id,
                { 
                    $push: {
                        unavailableDates: {
                            from: connection.from,
                            to: connection.to
                        }
                    }
                },
                { new: true }
            );

            // 3. Găsește informații pentru email
            const location = await locationModel.findById(payment.location_id);
            const user = await userModel.findById(payment.user_id);
            const host = await userModel.findById(payment.host_id);

            // 4. **NEW: Generate receipt automatically**
            try {
                console.log('🧾 Generating receipt for booking:', connection._id);
                const receiptUrl = await ReceiptService.generateReceiptPDF(connection, location, user);
                
                // Save receipt URL to booking
                await connectionModel.findByIdAndUpdate(
                    payment.connection_id,
                    { receipt_url: receiptUrl },
                    { new: true }
                );
                
                console.log('✅ Receipt generated and saved:', receiptUrl);
            } catch (receiptError) {
                console.error('❌ Receipt generation failed, but payment succeeded:', receiptError);
                // Don't fail the payment if receipt generation fails
            }

            // 4. Trimite email-uri de confirmare folosind EmailService
            const bookingDetails = {
                checkIn: connection.from.toDateString(),
                checkOut: connection.to.toDateString(),
                totalAmount: payment.total_amount,
                hostAmount: payment.host_amount,
                governmentTax: payment.government_tax,
                platformFee: payment.platform_commission,
                hostName: `${host.first_name} ${host.last_name}`,
                guestName: `${user.first_name} ${user.last_name}`,
                guestPhone: user.phone || 'Not provided',
                address: location.location,
                receiptUrl: connection.receipt_url // Include receipt URL in email
            };

            EmailService.sendTemplateEmail(
                'paymentCompleted',
                user.email,
                host.email,
                location.title,
                bookingDetails
            );

            console.log("Payment confirmation emails sent via EmailService");

        } else if (status === 'failed') {
            // Reverte statusul la "accepted" pentru retry
            await connectionModel.findByIdAndUpdate(
                payment.connection_id,
                { 
                    status: "Request accepted by host - Payment failed",
                    completed: false
                }
            );
        }

        return res.status(200).json({
            message: `Payment ${status} successfully`,
            payment: payment,
            booking_status: status === 'succeeded' ? 'confirmed' : 'payment_failed'
        });

    } catch (err) {
        console.error('Complete payment error:', err);
        next(err);
    }
};