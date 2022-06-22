const {validationResult} = require('express-validator');
const blogModel = require('../models/BlogModel');

exports.addBlogPost = async(req,res,next) => {
    console.log("Enter add blog post");
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    try{
        const blog = new blogModel(req.body);

        await blog.save();
        return res.status(201).json({
            message: "Location succesfully registered!",
        });
                        
    } catch(err){
        next(err);
    }
}