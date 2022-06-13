const {validationResult} = require('express-validator');
const locationModel = require('../models/LocationModel');
const connectionModel = require('../models/ConnectionModel');

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

        try{
            connectionModel.find({'location_id': connection.location_id, 'completed': false}, async function (err, conn) {
             if (err) return handleError(err);
   
             if(conn.length == 0) {
                return res.status(201).json({
                    message: "Connection succesfully accepted and no other conflicts!",
                });
             }

             console.log(`conn ${conn}`);

             for (let i = 0; i < conn.length; ++i) {
                 console.log(`Dates ${conn[i].from} to ${conn[i].to}`);
                if (!(conn[i].from > connection.to || conn[i].to < connection.from)) {
                    try{
                        console.log(`INSIDE Dates ${connection.from} to ${connection.to}`);
                        console.log(`Request for ${conn[i].location_id} auto deleted`);
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

             const location = await locationModel.findByIdAndUpdate(
                connection.location_id,
                { $push: {unavailableDates: {
                    from: connection.from,
                    to: connection.to
                }} },
                { new: true }
            );     

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