const {validationResult} = require('express-validator');
const locationModel = require('../models/LocationModel');
const connectionModel = require('../models/ConnectionModel');

exports.getLocationConnections = async(req,res,next) => {
    console.log("Enter get location connections");
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    try{
         connectionModel.find({'location_id': req.params.id, 'completed': false, 'status': 'Client request'}, function (err, conn) {
          if (err) return handleError(err);

          if(conn.length == 0) {
            return res.status(200).json({
                   message: "This location has no requests",
              });
          }
          return res.status(201).json({
            message: "Request succesfully returnes",
            user: conn,
          });
        })
                        
    } catch(err){
        next(err);
    }
}