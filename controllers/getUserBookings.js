const {validationResult} = require('express-validator');
const locationModel = require('../models/LocationModel');
const connectionModel = require('../models/ConnectionModel');

exports.getUserBookings = async(req,res,next) => {
    console.log("Enter get user bookings UPDATED");
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    try{
        // Caută toate booking-urile: completed SAU awaiting payment SAU payment in progress
        connectionModel.find({
            'user_id': req.params.id, 
            $or: [
                { 'completed': true },
                { 'status': 'Request accepted by host - Awaiting payment' },
                { 'status': 'Accepted - Payment in progress' },
                { 'status': 'Payment completed - Booking confirmed' },
                { 'status': 'Request accepted by host - Payment failed' }
            ]
        }, function (err, conn) {
            if (err) return handleError(err);

            if(conn.length == 0) {
                return res.status(200).json({
                    message: "This user has no bookings",
                });
            }

            // Separează booking-urile pe categorii pentru frontend
            const confirmedBookings = conn.filter(c => 
                c.completed === true || 
                c.status === 'Payment completed - Booking confirmed'
            );
            
            const pendingPayment = conn.filter(c => 
                c.status === 'Request accepted by host - Awaiting payment' ||
                c.status === 'Request accepted by host - Payment failed'
            );
            
            const paymentInProgress = conn.filter(c => 
                c.status === 'Accepted - Payment in progress'
            );

            return res.status(201).json({
                message: "User bookings successfully returned",
                requests: conn, // Păstrează pentru compatibilitate cu frontend-ul existent
                bookings: {
                    confirmed: confirmedBookings,
                    pendingPayment: pendingPayment,
                    paymentInProgress: paymentInProgress,
                    total: conn
                }
            });
        })
                        
    } catch(err){
        next(err);
    }
}