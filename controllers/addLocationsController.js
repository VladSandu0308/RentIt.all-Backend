const {validationResult} = require('express-validator');
const locationModel = require('../models/LocationModel');
const permitModel = require('../models/PermitModel');
const EmailService = require('../services/emailService');

exports.addLocation = async(req,res,next) => {
    console.log("Enter add listing");
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    try{
        const location = new locationModel(req.body);
        await location.save();

        console.log("Location saved:", req.body);

        // Process permits if included
        const processedPermits = [];
        if (req.body.permits) {
            console.log("Processing permits:", req.body.permits);
            
            for (const [permitType, documentUrl] of Object.entries(req.body.permits)) {
                if (documentUrl) {
                    const permit = new permitModel({
                        location_id: location._id,
                        permit_type: permitType,
                        document_url: documentUrl,
                        status: 'pending'
                    });
                    await permit.save();
                    processedPermits.push(permitType);
                    console.log(`Permit ${permitType} saved for location ${location._id}`);

                    // Send individual permit submission notification
                    EmailService.sendTemplateEmail(
                        'permitSubmitted',
                        'minister@rentit.all',
                        req.body.title,
                        permitType
                    );
                }
            }
        }

        // Send general location registration notification if no permits or as a summary
        if (!req.body.permits || processedPermits.length === 0) {
            const emailData = {
                from: 'house_share@gmail.com',
                to: 'minister@rentit.all',
                subject: `Cerere nouă de înregistrare - ${req.body.title}`,
                html: `
                    <h2>📋 Cerere nouă de înregistrare proprietate</h2>
                    <p>A fost depusă o cerere nouă:</p>
                    <ul>
                        <li><strong>Proprietate:</strong> ${req.body.title}</li>
                        <li><strong>Locația:</strong> ${req.body.location}</li>
                        <li><strong>Tipul:</strong> ${req.body.mode}</li>
                        <li><strong>Host:</strong> ${req.body.host_email}</li>
                    </ul>
                    <p>Documentul principal: <a href="${req.body.cerere}">Vezi PDF</a></p>
                    <p>Accesați panoul de administrare pentru a revizui această cerere.</p>
                `
            };
            EmailService.sendEmail(emailData);
        }

        return res.status(201).json({
            message: "Location successfully registered!",
            location_id: location._id,
            permits_processed: processedPermits.length
        });
                        
    } catch(err){
        console.error('Error in addLocation:', err);
        next(err);
    }
}