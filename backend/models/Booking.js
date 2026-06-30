const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  spotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingSpot',
    required: true
  },
  spotName: {
    type: String,
    required: true
  },
  vehicleNumber: {
    type: String,
    required: [true, 'Please add vehicle number'],
    trim: true,
    uppercase: true
  },
  vehicleType: {
    type: String,
    enum: ['car', 'suv', 'van', 'motorcycle'],
    default: 'car'
  },
  startTime: {
    type: Date,
    required: [true, 'Please add start time']
  },
  endTime: {
    type: Date,
    required: [true, 'Please add end time']
  },
  duration: {
    type: Number,
    required: true,
    min: [1, 'Duration must be at least 1 hour']
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'cash', 'mobile'],
    default: 'card'
  },
  paymentId: {
    type: String,
    default: null
  },
  cancelledAt: Date,
  cancellationReason: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate booking ID before save
BookingSchema.pre('save', function(next) {
  if (!this.bookingId) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.bookingId = `BK${year}${month}${day}${random}`;
  }
  next();
});

module.exports = mongoose.model('Booking', BookingSchema);