const {validationResult} = require('express-validator');
const userModel = require('../models/UserModel');

exports.getUserById = async(req,res,next) => {
    console.log("Enter get user by id");
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    try{
        userModel.findById(req.params.id, function (err, user) {
          if (err) return handleError(err);

          if(user.length == 0) {
            return res.status(200).json({
                   message: "User not found",
              });
          }
          return res.status(201).json({
            message: "User succesfully returned",
            user: user,
          });
        })
                        
    } catch(err){
        next(err);
    }
}