const {validationResult} = require('express-validator');
const permitModel = require('../models/PermitModel');
const locationModel = require('../models/LocationModel');
const EmailService = require('../services/emailService');

exports.getLocationPermits = async(req, res, next) => {
    console.log("Enter get location permits");
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    try{
        const { location_id } = req.params;

        const permits = await permitModel.find({ location_id: location_id })
            .sort({ created_at: -1 });

        return res.status(200).json({
            message: "Location permits retrieved successfully",
            permits: permits
        });

    } catch(err){
        console.error('Error fetching permits:', err);
        next(err);
    }
};

exports.getPendingPermits = async(req, res, next) => {
    console.log("Enter get pending permits");
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    try{
        const permits = await permitModel.find({ 
            status: 'pending'
        }).sort({ created_at: 1 }); // Oldest first

        // Get location details for each permit
        const permitsWithLocationData = await Promise.all(
            permits.map(async (permit) => {
                const location = await locationModel.findById(permit.location_id);
                return {
                    ...permit.toObject(),
                    location_details: location ? {
                        title: location.title,
                        location: location.location,
                        host_email: location.host_email
                    } : null
                };
            })
        );

        return res.status(200).json({
            message: "Pending permits retrieved successfully",
            permits: permitsWithLocationData
        });

    } catch(err){
        console.error('Error fetching pending permits:', err);
        next(err);
    }
};

exports.reviewPermit = async(req, res, next) => {
    console.log("Enter review permit");
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    try{
        const { permit_id } = req.params;
        const { status, permit_number, rejection_reason } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ 
                message: "Status must be either 'approved' or 'rejected'" 
            });
        }

        const updateData = {
            status: status,
            updated_at: new Date()
        };

        if (status === 'approved') {
            if (!permit_number) {
                return res.status(400).json({ 
                    message: "Permit number is required for approval" 
                });
            }
            updateData.permit_number = permit_number;
            updateData.issued_date = new Date();
            
            // Set expiry date to 1 year from now
            const expiryDate = new Date();
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
            updateData.expiry_date = expiryDate;
        }

        if (status === 'rejected') {
            if (!rejection_reason) {
                return res.status(400).json({ 
                    message: "Rejection reason is required" 
                });
            }
            updateData.rejection_reason = rejection_reason;
        }

        const permit = await permitModel.findByIdAndUpdate(
            permit_id,
            updateData,
            { new: true }
        );

        if (!permit) {
            return res.status(404).json({ message: "Permit not found" });
        }

        // Get location and host info for notification
        const location = await locationModel.findById(permit.location_id);
        
        // Send notification email using EmailService
        EmailService.sendTemplateEmail(
            'permitReviewed',
            location.host_email,
            location.title,
            permit.permit_type,
            status,
            permit.permit_number,
            rejection_reason
        );

        return res.status(200).json({
            message: `Permit ${status} successfully`,
            permit: permit
        });

    } catch(err){
        console.error('Error reviewing permit:', err);
        next(err);
    }
};

exports.createPermit = async(req, res, next) => {
    console.log("Enter create permit");
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    try{
        const { location_id, permit_type, document_url, status = 'pending' } = req.body;

        // Verifică dacă locația există
        const location = await locationModel.findById(location_id);
        if (!location) {
            return res.status(404).json({ message: "Location not found" });
        }

        // Șterge permisul vechi de același tip (dacă există)
        await permitModel.findOneAndDelete({ 
            location_id: location_id, 
            permit_type: permit_type 
        });

        // Creează permisul nou
        const permit = new permitModel({
            location_id,
            permit_type,
            document_url,
            status
        });

        await permit.save();

        // Trimite notificare către minister
        EmailService.sendTemplateEmail(
            'permitSubmitted',
            'minister@rentit.all',
            location.title,
            permit_type
        );

        return res.status(201).json({
            message: "Permit created successfully",
            permit: permit
        });

    } catch(err){
        console.error('Error creating permit:', err);
        next(err);
    }
};

exports.checkLocationCompliance = async(req, res, next) => {
    console.log("Enter check location compliance");
    
    try {
        const { location_id } = req.params;

        // Get location
        const location = await locationModel.findById(location_id);
        if (!location) {
            return res.status(404).json({ message: "Location not found" });
        }

        // Get all permits for this location
        const permits = await permitModel.find({ location_id: location_id });

        // Determine required permits based on location and mode
        let requiredPermits = ['businessLicense'];
        if (location.mode === 'Rent') {
            requiredPermits.push('shortTermRental');
        }

        const approvedPermits = permits.filter(p => p.status === 'approved').map(p => p.permit_type);
        const pendingPermits = permits.filter(p => p.status === 'pending').map(p => p.permit_type);
        const missingPermits = requiredPermits.filter(rp => 
            !approvedPermits.includes(rp) && !pendingPermits.includes(rp)
        );

        let complianceStatus = 'compliant';
        if (missingPermits.length > 0) {
            complianceStatus = 'non_compliant';
        } else if (pendingPermits.length > 0) {
            complianceStatus = 'pending_review';
        }

        return res.status(200).json({
            message: "Compliance status checked successfully",
            compliance: {
                status: complianceStatus,
                required_permits: requiredPermits,
                approved_permits: approvedPermits,
                pending_permits: pendingPermits,
                missing_permits: missingPermits,
                can_accept_bookings: complianceStatus === 'compliant'
            }
        });

    } catch(err){
        console.error('Error checking compliance:', err);
        next(err);
    }
};