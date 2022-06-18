const {validationResult} = require('express-validator');
const userModel = require('../models/UserModel');
const locationModel = require('../models/LocationModel');
const connectionModel = require('../models/ConnectionModel');

exports.deleteUser = async(req,res,next) => {
    console.log("Enter delete user");
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    try{
        const user = await userModel.findByIdAndDelete(
          req.params.id,
        );

        console.log(user)

        const location = await locationModel.deleteMany({'host_email': user.email});

        

        const connection = await connectionModel.deleteMany({'user_id': user._id});


        console.log(location)

        console.log(connection)


        return res.status(201).json({
            message: "User succesfully deleted"
        });
                        
    } catch(err){
        next(err);
    }
}