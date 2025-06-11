const {validationResult} = require('express-validator');
const locationModel = require('../models/LocationModel');
var amqp = require('amqplib/callback_api');

exports.addLocation = async(req,res,next) => {
    console.log("Enter add listing");
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    try{
        const location = new locationModel(req.body);

        await location.save();

        console.log(req.body);

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
                from: 'house_share@gmail.com',
                to: 'vlad.sandu@lsacbucuresti.ro',
                subject: `Cerere de înscriere în turism - ${req.body.title}`,
                html: `<p>There is a new reuqest for ${req.body.title}. View PDF: <a href="${req.body.cerere}">Click here</a></p>`
                };

                let message = JSON.stringify(body);


                channel.assertQueue(queue, {
                    durable: true
                });

                channel.sendToQueue(queue, Buffer.from(message));
                console.log(" [x] Sent %s", body.from);

            });
        });

        return res.status(201).json({
            message: "Location succesfully registered!",
        });
        } catch(err){
            next(err);
        }
}