const {validationResult} = require('express-validator');
const blogModel = require('../models/BlogModel');

exports.getPosts = async(req,res,next) => {
    console.log("Enter get blog posts");
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(422).json({ errors: errors.array() });
    }

    try{
      blogModel.find({}, function (err, posts) {
        

        if(!posts) {
          return res.status(200).json({
                 message: "This app has no posts",
                 posts: []
            });
        }
        return res.status(201).json({
          message: "Posts returned",
          posts_count:  posts.length,
          posts
        });
      })
                        
    } catch(err){
        next(err);
    }
}