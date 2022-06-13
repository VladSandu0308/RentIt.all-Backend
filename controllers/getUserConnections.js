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
         connectionModel.find({'user_id': req.params.id, 'completed': false}, function (err, conn) {
          if (err) return handleError(err);

          if(conn.length == 0) {
            return res.status(200).json({
                   message: "This user has no requests",
              });
          }

          
          return res.status(201).json({
            message: "User Requests succesfully returned",
            requests: conn
          });
        })
                        
    } catch(err){
        next(err);
    }
}