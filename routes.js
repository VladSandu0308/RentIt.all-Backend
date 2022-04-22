const router = require('express').Router();
const {body} = require('express-validator');
const {register} = require('./controllers/registerController');
const {login} = require('./controllers/loginController');

router.post('/register', [
  body('firstname',"The name must be of minimum 2 characters length")
  .notEmpty()
  .escape()
  .trim()
  .isLength({ min: 2 }),
  body('lastname',"The name must be of minimum 2 characters length")
  .notEmpty()
  .escape()
  .trim()
  .isLength({ min: 2 }),
  body('email',"Invalid email address")
  .notEmpty()
  .escape()
  .trim().isEmail(),
  body('password',"The Password must be of minimum 4 characters length").notEmpty().trim().isLength({ min: 4 })
], register);

router.post('/login',[
  body('email',"Invalid email")
  .notEmpty()
  .escape()
  .trim().isLength({min: 3}),
  body('password',"The Password must be of minimum 4 characters length").notEmpty().trim().isLength({ min: 4 })
],login);

module.exports = router;