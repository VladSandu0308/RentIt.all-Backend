const {validationResult} = require('express-validator');
const userModel = require('../models/UserModel');

exports.register = async(req,res,next) => {
    console.log("Enter register");
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    try{
        const user = new userModel(req.body);

        await user.save();
        return res.status(201).json({
            message: "User succesfully registered!",
        });
                        
    } catch(err){
        next(err);
    }
}