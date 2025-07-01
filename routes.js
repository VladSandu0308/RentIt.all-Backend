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
const { addUnavailableDates } = require('./controllers/addUnavilableDates');
const { addGradeToUser } = require('./controllers/addGradeToUser');
const { addGradeToLocation } = require('./controllers/addGrateToLocation');
const { addBlogPost } = require('./controllers/addBlogPost');
const { getPosts } = require('./controllers/getBlogs');
const { contact } = require('./controllers/contact');
const { createPaymentIntent, confirmPayment, getGovernmentStats, stripeWebhook } = require('./controllers/paymentController');
const { 
    initiatePaymentForAcceptedBooking, 
    completePaymentForAcceptedBooking 
} = require('./controllers/postAcceptPaymentController');
const { getPermitRequirements } = require('./controllers/getPermitRequirements');
const { 
    getLocationPermits, 
    getPendingPermits, 
    reviewPermit,
    checkLocationCompliance,
    createPermit
} = require('./controllers/permitController');
const { 
    requestInvoice, 
    generateInvoice, 
    updateInvoiceStatus, 
    getInvoiceDownloadUrl,
    getInvoiceRequests,
    downloadReceipt
} = require('./controllers/invoiceController');
const { createEvent, getEvents, updateEvent, deleteEvent } = require('./controllers/eventController');


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

router.post('/register', [], register);
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
router.put('/addUnavailableDates/:id', addUnavailableDates);

router.post('/createConnection', [], clientRequestForLocation);
router.put('/acceptConnection/:id', [], acceptConnectionRequest);
router.put('/rejectConnection/:id', [], rejectConnectionRequest);

router.get('/getLocationRequests/:id', getLocationConnections);
router.get('/getUserRequests/:id', getUserConnections);
router.get('/getLocationBookings/:id', getLocationBookings);
router.get('/getUserBookings/:id', getUserBookings);

router.delete('/deleteRequest/:id', deleteConnection);

router.put('/addRating/:id/:conn_id', addGradeToUser);
router.put('/addRatingLocation/:id/:conn_id', addGradeToLocation);

router.post('/blog', [], addBlogPost);
router.get('/blog', getPosts);

router.post('/contact', [], contact);

// Payment routes
router.post('/create-payment-intent', [], createPaymentIntent);
router.post('/confirm-payment', [], confirmPayment);
// //router.post('/webhook/stripe', express.raw({type: 'application/json'}), stripeWebhook);

router.post('/initiate-payment-for-booking', [], initiatePaymentForAcceptedBooking);
router.post('/complete-payment-for-booking', [], completePaymentForAcceptedBooking);

// router.get('/government-stats', getGovernmentStats);
//router.get('/host-earnings/:host_email', getHostEarnings);

router.post('/getPermitRequirements', [], getPermitRequirements);
router.get('/location/:location_id/permits', getLocationPermits);
router.get('/permits/pending', getPendingPermits);
router.put('/permits/:permit_id/review', [], reviewPermit);
router.post('/permits', [], createPermit);
router.get('/location/:location_id/compliance', checkLocationCompliance);

// Invoice routes
router.post('/requestInvoice/:bookingId', [], requestInvoice);
router.post('/generateInvoice/:bookingId', [], generateInvoice);
router.put('/updateInvoiceStatus/:bookingId', [], updateInvoiceStatus);
router.get('/downloadInvoice/:bookingId', getInvoiceDownloadUrl);
router.get('/getInvoiceRequests/:locationId', getInvoiceRequests);
router.get('/downloadReceipt/:bookingId', downloadReceipt);

// Event routes
router.post('/events', [], createEvent);
router.get('/events', getEvents);
router.put('/events/:id', [], updateEvent);
router.delete('/events/:id', deleteEvent);


module.exports = router;