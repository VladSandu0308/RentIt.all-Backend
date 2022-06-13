const {validationResult} = require('express-validator');
const locationModel = require('../models/LocationModel');
const connectionModel = require('../models/ConnectionModel');

exports.getLocationBookings = async(req,res,next) => {
    console.log("Enter get location boookings");
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    try{
         connectionModel.find({'location_id': req.params.id, 'completed': true}, function (err, conn) {
          if (err) return handleError(err);

          if(conn.length == 0) {
            return res.status(200).json({
                   message: "This user has no bookings",
              });
          }
          return res.status(201).json({
            message: "Location Bookings succesfully returned",
            bookings: conn,
          });
        })
                        
    } catch(err){
        next(err);
    }
}