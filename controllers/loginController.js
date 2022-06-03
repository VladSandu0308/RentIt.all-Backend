const {validationResult} = require('express-validator');
const userModel = require('../models/UserModel');

exports.login = async(req,res,next) => {
    console.log("Enter login");
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    try{
        userModel.find({'email': req.body.email}, function (err, user) {
          if (err) return handleError(err);

          if(user.length == 0) {
            return res.status(400).json({
                   message: "User not found",
              });
          }
          return res.status(201).json({
            message: "User succesfully signed in",
            user: user
          });
          console.log(user);
        })
        // return res.status(201).json({
        //     message: "User succesfully registered!",
        // });
                        
    } catch(err){
        next(err);
    }
}