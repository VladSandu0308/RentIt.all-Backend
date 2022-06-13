const {validationResult} = require('express-validator');
const connectionModel = require('../models/ConnectionModel');

exports.deleteConnection = async(req,res,next) => {
    console.log("Enter delete connection");
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    try{
      await connectionModel.findByIdAndDelete(
        req.params.id,
      );

      return res.status(201).json({
          message: "Request succesfully deleted"
      });
                        
    } catch(err){
        next(err);
    }
}