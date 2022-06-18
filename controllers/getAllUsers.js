const {validationResult} = require('express-validator');
const userModel = require('../models/UserModel');

exports.getAllUsers = async(req,res,next) => {
    console.log("Enter get all users");
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    try{
      userModel.find({'email': { $ne:'rentit.all.oficial@gmail.com'}}, function (err, users) {
        

        if(!users) {
          return res.status(200).json({
                 message: "This app has no users",
                 users: []
            });
        }
        return res.status(201).json({
          message: "Users returned",
          users_count:  users.length,
          users
        });
      })
                        
    } catch(err){
        next(err);
    }
}