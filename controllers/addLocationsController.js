const {validationResult} = require('express-validator');
const locationModel = require('../models/LocationModel');

exports.addLocation = async(req,res,next) => {
    console.log("Enter add listing");
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    try{
        const location = new locationModel(req.body);

        await location.save();
        return res.status(201).json({
            message: "Location succesfully registered!",
        });
                        
    } catch(err){
        next(err);
    }
}