const {validationResult} = require('express-validator');
const locationModel = require('../models/LocationModel');

exports.updateLocation = async(req,res,next) => {
    console.log("Enter update listing");
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    console.log(req.body);

    try{
        const location = await locationModel.findByIdAndUpdate(
          req.params.id,
          { $set: req.body },
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