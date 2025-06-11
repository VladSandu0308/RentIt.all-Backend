const {validationResult} = require('express-validator');
const locationModel = require('../models/LocationModel');
const connectionModel = require('../models/ConnectionModel');
const EmailService = require('../services/emailService');

exports.acceptConnectionRequest = async(req, res, next) => {
    console.log("Enter accept connection");
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    try {
        // Acceptă cererea
        const acceptedConnection = await connectionModel.findByIdAndUpdate(
            req.params.id,
            { $set: {
                status: "Request accepted by host - Awaiting payment",
                completed: false // Rămâne false până la plată
            }},
            { new: true}
        );

        if (!acceptedConnection) {
            return res.status(404).json({ message: "Connection not found" });
        }

        // Trimite email de confirmare acceptare folosind EmailService
        EmailService.sendTemplateEmail(
            'requestAccepted', 
            req.body.email, 
            req.body.location_title
        );

        // Găsește toate cererile PENDING pentru aceeași locație (exclusiv cea acceptată)
        const conflictingConnections = await connectionModel.find({
            'location_id': acceptedConnection.location_id, 
            'status': { $in: ['Pending', 'Request accepted by host - Awaiting payment'] },
            '_id': { $ne: acceptedConnection._id } // Exclude cererea acceptată
        });

        console.log(`Found ${conflictingConnections.length} potential conflicting connections`);

        let conflictsFound = 0;

        // Verifică doar cererile care se suprapun cu perioada acceptată
        for (let connection of conflictingConnections) {
            // Verifică dacă există suprapunere de date
            const hasOverlap = !(
                new Date(connection.from) > new Date(acceptedConnection.to) || 
                new Date(connection.to) < new Date(acceptedConnection.from)
            );

            if (hasOverlap) {
                console.log(`Conflict found with connection ${connection._id}`);
                
                // Rejectează cererea conflictuală
                await connectionModel.findByIdAndUpdate(
                    connection._id,
                    { $set: {
                        status: "Request rejected because of conflict",
                        completed: false
                    }},
                    { new: true}
                );
                
                conflictsFound++;
            }
        }

        console.log(`Total conflicts resolved: ${conflictsFound}`);

        return res.status(201).json({
            message: conflictsFound > 0 
                ? `Connection successfully accepted! ${conflictsFound} conflicting request(s) automatically rejected.`
                : "Connection successfully accepted with no conflicts!",
            acceptedConnection: acceptedConnection,
            conflictsResolved: conflictsFound
        });
                        
    } catch(err) {
        console.error('Error in acceptConnectionRequest:', err);
        next(err);
    }
};