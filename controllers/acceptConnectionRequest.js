const {validationResult} = require('express-validator');
const locationModel = require('../models/LocationModel');
const connectionModel = require('../models/ConnectionModel');
var amqp = require('amqplib/callback_api');


exports.acceptConnectionRequest = async(req,res,next) => {
    console.log("Enter accept connection");
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    try{
        const connection = await connectionModel.findByIdAndUpdate(
          req.params.id,
          { $set: {
            status: "Request accepted by host",
            completed: true
          }},
          { new: true}
        )

        const location = await locationModel.findByIdAndUpdate(
            connection.location_id,
            { $push: {unavailableDates: {
                from: connection.from,
                to: connection.to
            }} },
            { new: true }
        );

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
                    to: req.body.email,
                    subject: `Request accepted for location ${req.body.location_title}`,
                    text: `Your request for location ${req.body.location_title} has been accepted. You can now start the payment process!`
                };

                let message = JSON.stringify(body);


                channel.assertQueue(queue, {
                    durable: true
                });

                channel.sendToQueue(queue, Buffer.from(message));
                console.log(" [x] Sent %s", body.from);

            });
        });

        try{
            connectionModel.find({'location_id': connection.location_id, 'completed': false}, async function (err, conn) {
             if (err) return handleError(err);
   
             if(conn.length == 0) {
                return res.status(201).json({
                    message: "Connection succesfully accepted and no other conflicts!",
                });
             }

             for (let i = 0; i < conn.length; ++i) {
                if (!(conn[i].from > connection.to || conn[i].to < connection.from)) {
                    try{
                        const updated = await connectionModel.findByIdAndUpdate(
                          conn[i]._id,
                          { $set: {
                            status: "Request rejected because of conflict",
                            completed: false
                          }},
                          { new: true}
                        );                  
                      } catch(err){
                          next(err);
                      }
                }
             }

            
            
            console.log(location)

             return res.status(201).json({
                message: "Connection succesfully accepted and found conflict!",
            });
           })
                           
       } catch(err){
           next(err);
       }

        
                        
    } catch(err){
        next(err);
    }
}