const {validationResult} = require('express-validator');
const userModel = require('../models/UserModel');

exports.updateUser = async(req,res,next) => {
    console.log("Enter update user");
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    console.log(req.body);

    try{
        const user = await userModel.findByIdAndUpdate(
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