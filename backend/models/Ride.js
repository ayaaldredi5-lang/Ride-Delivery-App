const mongoose = require('mongoose');
const RideSchema = new mongoose.Schema( { rider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
pickup: String,
dropoff: String,

// Pricing in Libyan Dinars
distance: {
  type: Number,
  min: 0,
},

originalFare: {
  type: Number,
  min: 0,
},

minimumFare: {
  type: Number,
  min: 0,
},

// Negotiation offers
riderOffer: {
  type: Number,
  min: 0,
},

driverOffer: {
  type: Number,
  min: 0,
},

finalFare: {
  type: Number,
  min: 0,
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
