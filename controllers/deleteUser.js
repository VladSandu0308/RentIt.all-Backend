const {validationResult} = require('express-validator');
const userModel = require('../models/UserModel');

exports.deleteUser = async(req,res,next) => {
    console.log("Enter delete user");
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    try{
        await userModel.findByIdAndDelete(
          req.params.id,
        );

        return res.status(201).json({
            message: "User succesfully deleted"
        });
                        
    } catch(err){
        next(err);
    }
}