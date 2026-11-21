const Ride = require('../models/Ride');
// Create a new ride async function createRide(req, res) { const { pickup, dropoff } = req.body;
try { if (!pickup || !dropoff) { return res.status(400).json({ error: 'Pickup and dropoff are required', }); }
const ride = new Ride({
  pickup,
  dropoff,
  rider: req.user.userId,
  status: 'requested',
});

await ride.save();
return res.json(ride);
} catch (err) { console.error('Create ride error:', err); return res.status(500).json({ error: 'Failed to create ride', }); } }
// List rider rides async function listRides(req, res) { try { const rides = await Ride.find({ rider: req.user.userId, }).sort({ createdAt: -1 });
return res.json(rides);
} catch (err) { console.error('List rides error:', err); return res.status(500).json({ error: 'Failed to fetch rides', }); } }
// List available rides for drivers async function listPendingRides(req, res) { try { if (req.user.role !== 'driver') { return res.status(403).json({ error: 'Only drivers can see pending rides', }); }
const rides = await Ride.find({
  status: 'requested',
  $or: [
    { driver: null },
    { driver: req.user.userId },
  ],
})
  .populate('rider', 'name email')
  .sort({ createdAt: -1 });

return res.json(rides);
} catch (err) { console.error('Pending rides error:', err); return res.status(500).json({ error: 'Failed to fetch pending rides', }); } }
// List driver's accepted and completed rides async function listDriverRides(req, res) { try { if (req.user.role !== 'driver') { return res.status(403).json({ error: 'Only drivers can see their rides', }); }
const rides = await Ride.find({
  driver: req.user.userId,
  status: { $in: ['accepted', 'completed'] },
})
  .populate('rider', 'name email')
  .sort({ createdAt: -1 });

return res.json(rides);
} catch (err) { console.error('Driver rides error:', err); return res.status(500).json({ error: 'Failed to fetch driver rides', }); } }
// Submit a new negotiation offer async function makeOffer(req, res) { const { offerAmount } = req.body;
try { const ride = await Ride.findById(req.params.id);
if (!ride) {
  return res.status(404).json({ error: 'Ride not found' });
}

if (ride.status !== 'requested' || ride.fareAgreed) {
  return res.status(400).json({
    error: 'Negotiation is no longer available',
  });
}

const amount = Number(offerAmount);

if (
  offerAmount === undefined ||
  offerAmount === null ||
  offerAmount === '' ||
  !Number.isFinite(amount) ||
  amount <= 0
) {
  return res.status(400).json({
    error: 'Please enter a valid offer amount',
  });
}

if (
  !Number.isFinite(ride.originalFare) ||
  ride.originalFare <= 0
) {
  return res.status(400).json({
    error: 'Original fare has not been calculated yet',
  });
}

const minimumFare =
  ride.minimumFare ?? ride.originalFare * 0.75;

if (amount < minimumFare) {
  return res.status(400).json({
    error: 'Offer cannot be less than the minimum fare',
    minimumFare,
  });
}

let party;

if (req.user.role === 'driver') {
  party = 'driver';

  if (
    ride.driver &&
    String(ride.driver) !== String(req.user.userId)
  ) {
    return res.status(403).json({
      error: 'Another driver is negotiating this ride',
    });
  }

  if (ride.lastOfferBy === 'driver') {
    return res.status(400).json({
      error: 'Wait for the rider to respond first',
    });
  }

  // First driver to offer becomes assigned
  ride.driver = req.user.userId;
  ride.driverOffer = amount;

} else {
  party = 'rider';

  if (String(ride.rider) !== String(req.user.userId)) {
    return res.status(403).json({
      error: 'You are not the rider of this ride',
    });
  }

  if (!ride.driver) {
    return res.status(400).json({
      error: 'A driver must make the first offer',
    });
  }

  if (ride.lastOfferBy !== 'driver') {
    return res.status(400).json({
      error: 'Wait for the driver to make an offer first',
    });
  }

  ride.riderOffer = amount;
}

ride.minimumFare = minimumFare;
ride.lastOfferBy = party;

await ride.save();

return res.json({
  message: 'Offer submitted successfully',
  ride,
});
} catch (err) { console.
error('Make offer error:', err); return res.status(500).json({ error: 'Failed to submit offer', }); } }
// Accept the other party's last offer async function agreeFare(req, res) { try { const ride = await Ride.findById(req.params.id);
if (!ride) {
  return res.status(404).json({
    error: 'Ride not found',
  });
}

if (ride.status !== 'requested' || ride.fareAgreed) {
  return res.status(400).json({
    error: 'Fare cannot be changed',
  });
}

if (!ride.lastOfferBy) {
  return res.status(400).json({
    error: 'There is no offer to accept',
  });
}

const isDriver =
  req.user.role === 'driver' &&
  String(ride.driver) === String(req.user.userId);

const isRider =
  String(ride.rider) === String(req.user.userId);

if (!isDriver && !isRider) {
  return res.status(403).json({
    error: 'You are not part of this negotiation',
  });
}

if (
  (ride.lastOfferBy === 'driver' && !isRider) ||
  (ride.lastOfferBy === 'rider' && !isDriver)
) {
  return res.status(400).json({
    error: 'You cannot accept your own offer',
  });
}

const agreedAmount =
  ride.lastOfferBy === 'driver'
    ? ride.driverOffer
    : ride.riderOffer;

if (
  !Number.isFinite(agreedAmount) ||
  agreedAmount < ride.minimumFare
) {
  return res.status(400).json({
    error: 'Invalid agreed fare',
  });
}

ride.finalFare = agreedAmount;
ride.fareAgreed = true;

await ride.save();

return res.json({
  message: 'Fare agreed successfully',
  ride,
});
} catch (err) { console.error('Agree fare error:', err); return res.status(500).json({ error: 'Failed to agree on fare', }); } }
// Driver accepts the ride after fare agreement async function acceptRide(req, res) { try { if (req.user.role !== 'driver') { return res.status(403).json({ error: 'Only drivers can accept rides', }); }
const ride = await Ride.findById(req.params.id);

if (!ride) {
  return res.status(404).json({
    error: 'Ride not found',
  });
}

if (ride.status !== 'requested') {
  return res.status(400).json({
    error: 'Ride is not in requested state',
  });
}

if (String(ride.driver) !== String(req.user.userId)) {
  return res.status(403).json({
    error: 'This ride is assigned to another driver',
  });
}

if (!ride.fareAgreed || ride.finalFare === null) {
  return res.status(400).json({
    error: 'Fare agreement is required before accepting',
  });
}

ride.status = 'accepted';

await ride.save();

return res.json({
  message: 'Ride accepted successfully',
  ride,
});
} catch (err) { console.error('Accept ride error:', err); return res.status(500).json({ error: 'Failed to accept ride', }); } }
// Complete ride async function completeRide(req, res) { try { const ride = await Ride.findById(req.params.id);
if (!ride) {
  return res.status(404).json({
    error: 'Ride not found',
  });
}

if (req.user.role !== 'driver' ||
    String(ride.driver) !== String(req.user.userId)) {
  return res.status(403).json({
    error: 'Only the assigned driver can complete this ride',
  });
}

if (ride.status !== 'accepted') {
  return res.status(400).json({
    error: 'Ride is not in accepted state',
  });
}

ride.status = 'completed';
await ride.save();

return res.json(ride);
} catch (err) { console.error('Complete ride error:', err); return res.status(500).json({ error: 'Failed to complete ride', }); } }
// Cancel ride async function cancelRide(req, res) { try { const ride = await Ride.findById(req.params.id);
if (!ride) {
  return res.status(404).json({
    error: 'Ride not found',
  });
}

if (String(ride.rider) !== String(req.user.userId)) {
  return res.status(403).json({
    error: 'Not your ride',
  });
}

if (ride.status !== 'requested') {
  return res.status(400).json({
    error: 'Only requested rides can be cancelled',
  });
}

ride.status = 'cancelled';
await ride.save();

return res.json(ride);
} catch (err) { console.error('Cancel ride error:', err); return res.status(500).json({ error: 'Failed to cancel ride', }); } }
module.exports = { createRide, listRides, listPendingRides, listDriverRides, makeOffer, agreeFare, acceptRide, completeRide, cancelRide, };

  
