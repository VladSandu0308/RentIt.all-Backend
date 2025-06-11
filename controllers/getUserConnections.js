const {validationResult} = require('express-validator');
const locationModel = require('../models/LocationModel');
const connectionModel = require('../models/ConnectionModel');

exports.getUserConnections = async(req,res,next) => {
    console.log("Enter get user connections");
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    try{
        // Doar request-urile care sunt încă în stadiul de cerere - nu cele acceptate/în plată
        connectionModel.find({
            'user_id': req.params.id, 
            'completed': false,
            'status': { 
                $in: [
                    'Client request',
                    'Request rejected by host',
                    'Request rejected because of conflict'
                ]
            }
        }, function (err, conn) {
            if (err) return handleError(err);

            if(conn.length == 0) {
                return res.status(200).json({
                    message: "This user has no requests",
                });
            }

            // Separează pe tipuri pentru claritate
            const pendingRequests = conn.filter(c => c.status === 'Client request');
            const rejectedRequests = conn.filter(c => 
                c.status === 'Request rejected by host' || 
                c.status === 'Request rejected because of conflict'
            );

            return res.status(201).json({
                message: "User requests successfully returned",
                requests: conn, // Pentru compatibilitate cu frontend-ul existent
                breakdown: {
                    pending: pendingRequests,
                    rejected: rejectedRequests,
                    total: conn.length
                }
            });
        })
                        
    } catch(err){
        next(err);
    }
}