const {validationResult} = require('express-validator');
const locationModel = require('../models/LocationModel');
const connectionModel = require('../models/ConnectionModel');

exports.clientRequestForLocation = async(req,res,next) => {
    console.log("Enter add connection");
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    try{
        const connection = new connectionModel(req.body);

        await connection.save();
        return res.status(201).json({
            message: "Connection succesfully registered!",
        });
                        
    } catch(err){
        next(err);
    }
}