const {validationResult} = require('express-validator');
const locationModel = require('../models/LocationModel');

exports.getLocationById = async(req,res,next) => {
    console.log("Enter location by id");
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    try{
      locationModel.findById(req.params.id, function (err, location) {
        if(err) {
          console.log(err);
          return res.status(400).json({
            message: "Something happened"
          })
        }

        return res.status(201).json({
          message: "Location returned",
          location
        });
        
      })
                        
    } catch(err){
        next(err);
    }
}