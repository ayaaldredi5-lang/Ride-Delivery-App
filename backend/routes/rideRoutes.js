const router = require('express').Router();

const {
  createRide,
  listRides,
  listPendingRides,
  listDriverRides,
  makeOffer,
  agreeFare,
  acceptRide,
  completeRide,
  cancelRide,
} = require('../controllers/rideController');

const auth = require('../middlewares/authMiddleware');

// Ride routes
router.post('/', auth, createRide);
router.get('/', auth, listRides);
router.get('/pending', auth, listPendingRides);
router.get('/driver', auth, listDriverRides);

// Negotiation routes
router.post('/:id/offer', auth, makeOffer);
router.post('/:id/agree-fare', auth, agreeFare);

// Ride status routes
router.post('/:id/accept', auth, acceptRide);
router.post('/:id/complete', auth, completeRide);
router.post('/:id/cancel', auth, cancelRide);

router.patch('/:id/complete', auth, completeRide);

module.exports = router;
