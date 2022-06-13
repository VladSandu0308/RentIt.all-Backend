const router = require('express').Router();
const {body} = require('express-validator');
const {register} = require('./controllers/registerController');
const {login} = require('./controllers/loginController');
const { addLocation } = require('./controllers/addLocationsController');
const { getOwnLocations } = require('./controllers/getOwnLocationsController');
const { getLocations } = require('./controllers/getLocationsController');
const { updateLocation } = require('./controllers/updateLocationController');
const { deleteLocation } = require('./controllers/deleteLocationController');
const { getUser } = require('./controllers/getUser');
const { clientRequestForLocation } = require('./controllers/clientRequestForLocation');
const { acceptConnectionRequest } = require('./controllers/acceptConnectionRequest');
const { rejectConnectionRequest } = require('./controllers/rejectConnectionRequest');
const { getLocationConnections } = require('./controllers/getLocationConnections');
const { getUserConnections } = require('./controllers/getUserConnections');
const { getLocationBookings } = require('./controllers/getLocationBookings');
const { getUserBookings } = require('./controllers/getUserBookings');
const { deleteConnection } = require('./controllers/deleteConnection');
const { updateUser } = require('./controllers/updateUser');
const { deleteUser } = require('./controllers/deleteUser');
const { getAllUsers } = require('./controllers/getAllUsers');
const { getLocationById } = require('./controllers/getLocationById');
const { getUserById } = require('./controllers/getUserById');

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

router.get('/user/:email', getUser);
router.get('/getUserById/:id', getUserById);
router.put('/user/:id', updateUser);
router.delete('/user/:id', deleteUser);
router.get('/users', getAllUsers);

router.post('/addLocation', [], addLocation);
router.get('/getOwnLocations/:email', getOwnLocations);
router.get('/getLocation/:id', getLocationById);
router.post('/getLocations/:email', getLocations);
router.put('/location/:id', updateLocation);
router.delete('/location/:id', deleteLocation);

router.post('/createConnection', [], clientRequestForLocation);
router.put('/acceptConnection/:id', [], acceptConnectionRequest);
router.put('/rejectConnection/:id', [], rejectConnectionRequest);

router.get('/getLocationRequests/:id', getLocationConnections);
router.get('/getUserRequests/:id', getUserConnections);
router.get('/getLocationBookings/:id', getLocationBookings);
router.get('/getUserBookings/:id', getUserBookings);

router.delete('/deleteRequest/:id', deleteConnection);


module.exports = router;