const router = require('express').Router();
const {body} = require('express-validator');
const {register} = require('./controllers/registerController');
const {login} = require('./controllers/loginController');
const { addLocation } = require('./controllers/addLocationsController');
const { getOwnLocations } = require('./controllers/getOwnLocationsController');
const { getLocations } = require('./controllers/getLocationsController');
const { updateLocation } = require('./controllers/updateLocationController');
const { deleteLocation } = require('./controllers/deleteLocationController');

router.post('/register', [
  body('first_name',"The name must be of minimum 2 characters length")
  .notEmpty()
  .escape()
  .trim()
  .isLength({ min: 2 }),
  body('last_name',"The name must be of minimum 2 characters length")
  .notEmpty()
  .escape()
  .trim()
  .isLength({ min: 2 }),
  body('email',"Invalid email address")
  .notEmpty()
  .escape()
  .trim().isEmail(),
  body('phone',"Phone Number should have 10 digits").notEmpty().trim().isLength({ min: 10, max:10 })
], register);

router.post('/login',[
  body('email',"Invalid email")
  .notEmpty()
  .escape()
  .trim().isLength({min: 3}),
],login);

router.post('/addLocation', [], addLocation);
router.get('/getOwnLocations/:email', getOwnLocations);
router.get('/getLocations/:email', getLocations);
router.put('/location/:id', updateLocation);
router.delete('/location/:id', deleteLocation);

module.exports = router;