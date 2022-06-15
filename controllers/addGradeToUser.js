const {validationResult} = require('express-validator');
const userModel = require('../models/UserModel');
const connectionModel = require('../models/ConnectionModel');

exports.addGradeToUser = async(req,res,next) => {
    console.log("Enter update user");
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    console.log(req.params);

    try{
        userModel.findById(req.params.id, async function (err, user) {
          if (err) return handleError(err);

          if(!user) {
            return res.status(200).json({
                   message: "User not found",
              });
          }

          const newReviewCount = user.review_count + 1;
          const newGrade = ((Number(user.grade * user.review_count) + Number(req.body.grade)) / newReviewCount).toFixed(2)

          const user2 = await userModel.findByIdAndUpdate(
            req.params.id,
            { $set: {grade: newGrade, review_count: newReviewCount} },
            { new: true }
          );

          const connection2 = await connectionModel.findByIdAndUpdate(
            req.params.conn_id,
            { $set: {reviewed_location: true}},
            { new: true }
          )
  
          return res.status(201).json({
              message: "User rating succesfully updatesd!",
              user2
          });
        });        
    } catch(err){
        next(err);
    }
}