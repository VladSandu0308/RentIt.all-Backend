const {validationResult} = require('express-validator');
const locationModel = require('../models/LocationModel');
const connectionModel = require('../models/ConnectionModel');

exports.rejectConnectionRequest = async(req,res,next) => {
    console.log("Enter add connection");
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    try{
        const connection = await connectionModel.findByIdAndUpdate(
          req.params.id,
          { $set: {
            status: "Request rejected by host",
            completed: false
          }},
          { new: true}
        )

        return res.status(201).json({
            message: "Connection succesfully rejected!",
        });
                        
    } catch(err){
        next(err);
    }
}