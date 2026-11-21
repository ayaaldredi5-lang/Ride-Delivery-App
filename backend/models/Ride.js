const mongoose = require('mongoose');
const RideSchema = new mongoose.Schema( { rider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', },
driver: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  default: null,
},

pickup: String,
dropoff: String,

// Distance and pricing in Libyan Dinars
distance: {
  type: Number,
  min: 0,
  default: null,
},

originalFare: {
  type: Number,
  min: 0,
  default: null,
},

minimumFare: {
  type: Number,
  min: 0,
  default: null,
},

// Negotiation offers
riderOffer: {
  type: Number,
  min: 0,
  default: null,
},

driverOffer: {
  type: Number,
  min: 0,
  default: null,
},

lastOfferBy: {
  type: String,
  enum: ['rider', 'driver'],
  default: null,
},

finalFare: {
  type: Number,
  min: 0,
  default: null,
},

fareAgreed: {
  type: Boolean,
  default: false,
},

status: {
  type: String,
  enum: ['requested', 'accepted', 'completed', 'cancelled'],
  default: 'requested',
},
}, { timestamps: true } );
module.exports = mongoose.model('Ride', RideSchema);
