// controllers/paymentController.js
const { validationResult } = require('express-validator');
const stripe = require('../services/stripe');
const paymentModel = require('../models/PaymentModel');
const connectionModel = require('../models/ConnectionModel');
const locationModel = require('../models/LocationModel');
const userModel = require('../models/UserModel');

// Creare Payment Intent
exports.createPaymentIntent = async (req, res, next) => {
    console.log("Enter create payment intent");
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    try {
        const { connection_id, total_amount } = req.body;

        // Găsește conexiunea pentru a obține detaliile
        const connection = await connectionModel.findById(connection_id);
        if (!connection) {
            return res.status(404).json({ message: "Connection not found" });
        }

        // Găsește locația și host-ul
        const location = await locationModel.findById(connection.location_id);
        const host = await userModel.find({ email: location.host_email });

        // Calculează comisioanele
        const commissionRate = 0.10; // 10%
        const taxRate = 0.05; // 5%
        
        const platformCommission = Math.round(total_amount * commissionRate);
        const governmentTax = Math.round(total_amount * taxRate);
        const hostAmount = total_amount - platformCommission - governmentTax;

        // Creare Payment Intent în Stripe
        const paymentIntent = await stripe.paymentIntents.create({
            amount: total_amount * 100, // Stripe folosește cenți
            currency: 'ron',
            metadata: {
                connection_id: connection_id,
                user_id: connection.user_id,
                host_id: host[0]._id.toString(),
                location_id: connection.location_id,
                location_title: location.title
            }
        });

        // Salvează payment în baza de date
        const payment = new paymentModel({
            connection_id: connection_id,
            user_id: connection.user_id,
            host_id: host[0]._id,
            location_id: connection.location_id,
            stripe_payment_intent_id: paymentIntent.id,
            total_amount: total_amount,
            host_amount: hostAmount,
            platform_commission: platformCommission,
            government_tax: governmentTax,
            commission_rate: commissionRate,
            tax_rate: taxRate,
            status: 'pending'
        });

        await payment.save();

        return res.status(201).json({
            message: "Payment intent created successfully",
            client_secret: paymentIntent.client_secret,
            payment_id: payment._id,
            breakdown: {
                total: total_amount,
                host_amount: hostAmount,
                platform_commission: platformCommission,
                government_tax: governmentTax
            }
        });

    } catch (err) {
        console.error('Stripe error:', err);
        next(err);
    }
};

// Confirmare plată
exports.confirmPayment = async (req, res, next) => {
    console.log("Enter confirm payment");
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    try {
        const { payment_intent_id, status } = req.body;

        // Actualizează payment în baza de date
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

        // Dacă plata a fost reușită, actualizează și conexiunea
        if (status === 'succeeded') {
            await connectionModel.findByIdAndUpdate(
                payment.connection_id,
                { 
                    status: "Payment completed",
                    completed: true,
                    payment_id: payment._id
                },
                { new: true }
            );

            // Adaugă datele ca indisponibile
            const location = await locationModel.findByIdAndUpdate(
                payment.location_id,
                { 
                    $push: {
                        unavailableDates: {
                            from: payment.connection?.from || new Date(),
                            to: payment.connection?.to || new Date()
                        }
                    }
                },
                { new: true }
            );
        }

        return res.status(200).json({
            message: "Payment confirmed successfully",
            payment: payment
        });

    } catch (err) {
        console.error('Payment confirmation error:', err);
        next(err);
    }
};

// Statistici pentru Minister
exports.getGovernmentStats = async (req, res, next) => {
    console.log("Enter government stats");

    try {
        // Total taxe colectate
        const totalTaxes = await paymentModel.aggregate([
            { $match: { status: 'succeeded' } },
            { 
                $group: { 
                    _id: null, 
                    total_government_tax: { $sum: "$government_tax" },
                    total_platform_commission: { $sum: "$platform_commission" },
                    total_transactions: { $sum: 1 },
                    total_revenue: { $sum: "$total_amount" }
                } 
            }
        ]);

        // Statistici pe lună
        const monthlyStats = await paymentModel.aggregate([
            { $match: { status: 'succeeded' } },
            {
                $group: {
                    _id: {
                        year: { $year: "$created_at" },
                        month: { $month: "$created_at" }
                    },
                    monthly_tax: { $sum: "$government_tax" },
                    monthly_commission: { $sum: "$platform_commission" },
                    monthly_transactions: { $sum: 1 },
                    monthly_revenue: { $sum: "$total_amount" }
                }
            },
            { $sort: { "_id.year": -1, "_id.month": -1 } },
            { $limit: 12 }
        ]);

        // Top locații după venituri
        const topLocations = await paymentModel.aggregate([
            { $match: { status: 'succeeded' } },
            {
                $group: {
                    _id: "$location_id",
                    total_revenue: { $sum: "$total_amount" },
                    total_bookings: { $sum: 1 },
                    total_tax_generated: { $sum: "$government_tax" }
                }
            },
            { $sort: { total_revenue: -1 } },
            { $limit: 10 }
        ]);

        // Populează cu datele locațiilor
        const populatedLocations = await locationModel.populate(topLocations, {
            path: '_id',
            select: 'title location host_email'
        });

        // Top host-uri după venituri
        const topHosts = await paymentModel.aggregate([
            { $match: { status: 'succeeded' } },
            {
                $group: {
                    _id: "$host_id",
                    total_earned: { $sum: "$host_amount" },
                    total_bookings: { $sum: 1 },
                    total_tax_contributed: { $sum: "$government_tax" }
                }
            },
            { $sort: { total_earned: -1 } },
            { $limit: 10 }
        ]);

        // Populează cu datele host-urilor
        const populatedHosts = await userModel.populate(topHosts, {
            path: '_id',
            select: 'first_name last_name email'
        });

        return res.status(200).json({
            message: "Government statistics retrieved successfully",
            overview: totalTaxes[0] || {
                total_government_tax: 0,
                total_platform_commission: 0,
                total_transactions: 0,
                total_revenue: 0
            },
            monthly_breakdown: monthlyStats,
            top_locations: populatedLocations,
            top_hosts: populatedHosts
        });

    } catch (err) {
        console.error('Government stats error:', err);
        next(err);
    }
};

// Webhook pentru Stripe (opțional, pentru siguranță suplimentară)
exports.stripeWebhook = async (req, res, next) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.log(`Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            await paymentModel.findOneAndUpdate(
                { stripe_payment_intent_id: paymentIntent.id },
                { status: 'succeeded', updated_at: new Date() }
            );
            break;
        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            await paymentModel.findOneAndUpdate(
                { stripe_payment_intent_id: failedPayment.id },
                { status: 'failed', updated_at: new Date() }
            );
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).json({ received: true });
};