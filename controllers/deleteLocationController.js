const {validationResult} = require('express-validator');
const locationModel = require('../models/LocationModel');

exports.deleteLocation = async(req,res,next) => {
    console.log("Enter delete listing");
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    try{
        await locationModel.findByIdAndDelete(
          req.params.id,
        );

        return res.status(201).json({
            message: "Location succesfully deleted"
        });
                        
    } catch(err){
        next(err);
    }
}