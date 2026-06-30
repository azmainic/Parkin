const mongoose = require('mongoose');

const FreeWindowSchema = new mongoose.Schema({
  start: String, // "18:30"
  end: String,   // "08:00"
  isFree: Boolean
});

const ParkingSpotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a parking spot name'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  city: {
    type: String,
    required: [true, 'Please add a city'],
    enum: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Bristol']
  },
  postcode: {
    type: String,
    required: [true, 'Please add a postcode']
  },
  coordinates: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalSpots: {
    type: Number,
    required: [true, 'Please add total number of spots'],
    min: [1, 'At least 1 spot required']
  },
  availableSpots: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Available spots cannot be negative']
  },
  hourlyRate: {
    type: Number,
    default: 0,
    min: [0, 'Hourly rate cannot be negative']
  },
  dailyRate: {
    type: Number,
    default: 0,
    min: [0, 'Daily rate cannot be negative']
  },
  isFree: {
    type: Boolean,
    default: false
  },
  freeWindows: {
    monday: FreeWindowSchema,
    tuesday: FreeWindowSchema,
    wednesday: FreeWindowSchema,
    thursday: FreeWindowSchema,
    friday: FreeWindowSchema,
    saturday: FreeWindowSchema,
    sunday: FreeWindowSchema
  },
  maxStay: {
    type: Number,
    default: 24,
    min: [1, 'Max stay must be at least 1 hour']
  },
  restrictions: [String],
  amenities: [String],
  images: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  openingTime: {
    type: String,
    default: '06:00'
  },
  closingTime: {
    type: String,
    default: '23:00'
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Update lastUpdated on save
ParkingSpotSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

module.exports = mongoose.model('ParkingSpot', ParkingSpotSchema);