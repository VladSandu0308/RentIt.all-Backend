const {validationResult} = require('express-validator');
const locationModel = require('../models/LocationModel');
const connectionModel = require('../models/ConnectionModel');
const EmailService = require('../services/emailService');
var amqp = require('amqplib/callback_api');

exports.clientRequestForLocation = async(req,res,next) => {
    console.log("Enter add connection");
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    try{
        const connection = new connectionModel(req.body);
        await connection.save();
        console.log("✅ Connection created successfully:", connection._id);

       // 2. Trimite email de notificare (non-blocking)
        EmailService.sendTemplateEmail(
            'newRequest', 
            req.body.host_email, 
            req.body.location_title
        );

        // 3. Returnează răspuns imediat (nu așteaptă email-ul)
        return res.status(201).json({
            message: "Connection successfully registered!",
            connection_id: connection._id
        });
                        
    } catch(err){
        console.error('❌ Database error in clientRequestForLocation:', err);
        next(err);
    }
}