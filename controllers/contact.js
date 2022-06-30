const {validationResult} = require('express-validator');
var amqp = require('amqplib/callback_api');


exports.contact = async(req,res,next) => {
    console.log("Enter contact");
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    try{

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
                    from: req.body.email,
                    to: 'rentit.all.oficial@gmail.com',
                    subject: `A contact request has been made`,
                    html: `You got a message from: <br>
                      
                      Full Name: ${req.body.first_name} ${req.body.last_name} <br>
                      Email : ${req.body.email} <br>
                      Phone: ${req.body.phone} <br>
                      Message: ${req.body.message}`,
                };

                let message = JSON.stringify(body);


                channel.assertQueue(queue, {
                    durable: true
                });

                channel.sendToQueue(queue, Buffer.from(message));
                console.log(" [x] Sent %s", body.from);

                return res.status(201).json({
                    message: "Message delivered!",
                });

            });
        });
                           

        
                        
    } catch(err){
        next(err);
    }
}