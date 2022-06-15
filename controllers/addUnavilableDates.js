const {validationResult} = require('express-validator');
const locationModel = require('../models/LocationModel');

exports.addUnavailableDates = async(req,res,next) => {
    console.log("Enter add unavailability");
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    console.log(req.body);

    try{
        const location = await locationModel.findByIdAndUpdate(
          req.params.id,
          { $push: {unavailableDates: {
            from: req.body.from,
            to: req.body.to
          }} },
          { new: true }
        );

        return res.status(201).json({
            message: "Location succesfully updatesd!",
            location
        });
                        
    } catch(err){
        next(err);
    }
}