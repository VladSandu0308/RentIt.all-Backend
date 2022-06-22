const {validationResult} = require('express-validator');
const locationModel = require('../models/LocationModel');
const connectionModel = require('../models/ConnectionModel');
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

        amqp.connect('amqp://rabbitmq', function(error0, connection) {
            if (error0) {
                throw error0;
            }
            connection.createChannel(function(error1, channel) {
                if (error1) {
                    throw error1;
                }

                var queue = 'queue';
                var body = {
                    email: req.body.host_email,
                    subject: `New request for location ${req.body.location_title}`,
                    text: `You have received a new request for location ${req.body.location_title}. Check your account!`
                };

                let message = JSON.stringify(body);


                channel.assertQueue(queue, {
                    durable: true
                });

                channel.sendToQueue(queue, Buffer.from(message));
                console.log(" [x] Sent %s", body.email);

                return res.status(201).json({
                    message: "Connection succesfully registered!",
                });

            });
        });
       
                        
    } catch(err){
        next(err);
    }
}