const {validationResult} = require('express-validator');
const connectionModel = require('../models/ConnectionModel');
const locationModel = require('../models/LocationModel');
const userModel = require('../models/UserModel');
const EmailService = require('../services/emailService');
const ReceiptService = require("../services/receiptService");

exports.downloadReceipt = async (req, res, next) => {
    console.log("Enter download receipt");
    
    try {
        const { bookingId } = req.params;
        
        const booking = await connectionModel.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Check if booking is confirmed/completed
        if (!booking.completed || !booking.status.includes('Payment completed')) {
            return res.status(400).json({ 
                message: "Receipt only available for confirmed bookings" 
            });
        }

        // If receipt already exists, return it immediately
        if (booking.receipt_url) {
            console.log('✅ Receipt already exists, returning URL');
            return res.json({ 
                message: 'Receipt URL retrieved successfully',
                download_url: booking.receipt_url 
            });
        }

        // If receipt doesn't exist, generate it on-demand
        console.log('🧾 Receipt not found, generating on-demand for booking:', bookingId);
        
        try {
            // Get booking details for receipt generation
            const location = await locationModel.findById(booking.location_id);
            const user = await userModel.findById(booking.user_id);
            
            if (!location || !user) {
                return res.status(404).json({ 
                    message: "Missing booking details for receipt generation" 
                });
            }

            // Generate receipt using the same service
            const receiptUrl = await ReceiptService.generateReceiptPDF(booking, location, user);
            
            // Save receipt URL to booking for future requests
            await connectionModel.findByIdAndUpdate(
                bookingId,
                { receipt_url: receiptUrl },
                { new: true }
            );
            
            console.log('✅ Receipt generated on-demand and saved:', receiptUrl);
            
            return res.json({ 
                message: 'Receipt generated and retrieved successfully',
                download_url: receiptUrl,
                generated_on_demand: true
            });
            
        } catch (generationError) {
            console.error('❌ On-demand receipt generation failed:', generationError);
            
            return res.status(500).json({ 
                message: "Receipt generation failed. Please try again later.",
                error: process.env.NODE_ENV === 'development' ? generationError.message : undefined
            });
        }

    } catch (error) {
        console.error('❌ Error in downloadReceipt:', error);
        next(error);
    }
};


// Request Invoice (Guest endpoint)
exports.requestInvoice = async (req, res, next) => {
    console.log("Enter request invoice");
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    try {
        const { bookingId } = req.params;
        const invoiceDetails = req.body;

        // Find the booking
        const booking = await connectionModel.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Check if booking is confirmed
        if (!booking.completed || !booking.status.includes('Payment completed')) {
            return res.status(400).json({ 
                message: "Can only request invoice for confirmed bookings" 
            });
        }

        // Update booking with invoice request
        await connectionModel.findByIdAndUpdate(bookingId, {
            invoice_status: 'requested',
            invoice_details: invoiceDetails,
            invoice_requested_at: new Date()
        });

        // Get location and host info for notification
        const location = await locationModel.findById(booking.location_id);
        const host = await userModel.find({ email: location.host_email });

        // Send notification email to host
        EmailService.sendTemplateEmail(
            'invoiceRequested',
            location.host_email,
            location.title,
            invoiceDetails.company_name
        );

        res.json({ message: 'Invoice request submitted successfully' });
    } catch (error) {
        console.error('Error requesting invoice:', error);
        next(error);
    }
};

// Generate Invoice (Host endpoint)
exports.generateInvoice = async (req, res, next) => {
    console.log("Enter generate invoice");
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    try {
        const { bookingId } = req.params;
        const { method, invoice_number, invoice_file_url } = req.body;

        // Find the booking
        const booking = await connectionModel.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Check if invoice was requested
        if (booking.invoice_status !== 'requested' && booking.invoice_status !== 'processing') {
            return res.status(400).json({ 
                message: "No invoice request found for this booking" 
            });
        }

        const updateData = {
            invoice_status: 'generated',
            invoice_method: method,
            invoice_generated_at: new Date()
        };

        if (method === 'manual') {
            if (!invoice_number || !invoice_file_url) {
                return res.status(400).json({ 
                    message: "Invoice number and file URL are required for manual method" 
                });
            }
            updateData.invoice_number = invoice_number;
            updateData.invoice_file_url = invoice_file_url;
        }

        // Update booking
        await connectionModel.findByIdAndUpdate(bookingId, updateData);

        // Get guest and location info
        const guest = await userModel.findById(booking.user_id);
        const location = await locationModel.findById(booking.location_id);

        // Send notification email to guest
        EmailService.sendTemplateEmail(
            'invoiceGenerated',
            guest.email,
            location.title,
            booking.invoice_details.company_name
        );

        res.json({ message: 'Invoice generated successfully' });
    } catch (error) {
        console.error('Error generating invoice:', error);
        next(error);
    }
};

// Update Invoice Status (Host endpoint)
exports.updateInvoiceStatus = async (req, res, next) => {
    console.log("Enter update invoice status");
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    try {
        const { bookingId } = req.params;
        const { status } = req.body;

        await connectionModel.findByIdAndUpdate(bookingId, {
            invoice_status: status,
            updated_at: new Date()
        });

        res.json({ message: 'Invoice status updated successfully' });
    } catch (error) {
        console.error('Error updating invoice status:', error);
        next(error);
    }
};

// Download Invoice (Guest endpoint)
exports.getInvoiceDownloadUrl = async (req, res, next) => {
    console.log("Enter get invoice download URL");
    
    try {
        const { bookingId } = req.params;
        
        const booking = await connectionModel.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (booking.invoice_status !== 'generated' || !booking.invoice_file_url) {
            return res.status(404).json({ message: "Invoice not available" });
        }

        res.json({ 
            message: 'Invoice URL retrieved successfully',
            download_url: booking.invoice_file_url 
        });
    } catch (error) {
        console.error('Error getting invoice URL:', error);
        next(error);
    }
};

// Get Invoice Requests for Location (Host endpoint)
exports.getInvoiceRequests = async (req, res, next) => {
    console.log("Enter get invoice requests");
    
    try {
        const { locationId } = req.params;

        const bookings = await connectionModel.find({
            location_id: locationId,
            invoice_status: { $in: ['requested', 'processing'] }
        }).sort({ invoice_requested_at: -1 });

        // Get user details for each booking
        const bookingsWithUserData = await Promise.all(
            bookings.map(async (booking) => {
                const user = await userModel.findById(booking.user_id);
                return {
                    ...booking.toObject(),
                    user_details: user ? {
                        first_name: user.first_name,
                        last_name: user.last_name,
                        email: user.email
                    } : null
                };
            })
        );

        res.json({
            message: 'Invoice requests retrieved successfully',
            requests: bookingsWithUserData
        });
    } catch (error) {
        console.error('Error getting invoice requests:', error);
        next(error);
    }
};