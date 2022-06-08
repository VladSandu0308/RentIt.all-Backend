const {validationResult} = require('express-validator');
const locationModel = require('../models/LocationModel');

exports.getOwnLocations = async(req,res,next) => {
    console.log("Enter get own listings");
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    try{
      locationModel.find({'host_email': req.params.email}, function (err, locations) {
        if (err) return handleError(err);

        if(locations.length == 0) {
          return res.status(200).json({
                 message: "This user has no locations"
            });
        }
        return res.status(201).json({
          message: "Locations returned",
          locations_count:  locations.length,
          locations
        });
      })
                        
    } catch(err){
        next(err);
    }
}