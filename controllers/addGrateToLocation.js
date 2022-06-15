const {validationResult} = require('express-validator');
const locationModel = require('../models/LocationModel');
const connectionModel = require('../models/ConnectionModel');

exports.addGradeToLocation = async(req,res,next) => {
    console.log("Enter update user");
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    console.log(req.body);

    try{
        locationModel.findById(req.params.id, async function (err, location) {
          if (err) return handleError(err);

          if(location.length == 0) {
            return res.status(200).json({
                   message: "User not found",
              });
          }

          const newReviewCount = location.review_count + 1;
          const newGrade = ((Number(location.grade * location.review_count) + Number(req.body.grade)) / newReviewCount).toFixed(2)

          const location2 = await locationModel.findByIdAndUpdate(
            req.params.id,
            { $set: {grade: newGrade, review_count: newReviewCount} },
            { new: true }
          );

          const connection2 = await connectionModel.findByIdAndUpdate(
            req.params.conn_id,
            { $set: {reviewed_user: true}},
            { new: true }
          )

          console.log(connection2);
  
          return res.status(201).json({
              message: "User rating succesfully updatesd!",
              user2: location2
          });
        });        
    } catch(err){
        next(err);
    }
}