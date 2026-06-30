const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const ParkingSpot = require('../models/ParkingSpot');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

// ============================================
// PROTECTED ROUTES (All booking routes require auth)
// ============================================

// @desc    Get all bookings for current user
// @route   GET /api/bookings
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    
    // If user is 'user' role, only show their bookings
    if (req.user.role === 'user') {
      query.userId = req.user.id;
    }
    // If 'council' or 'admin', show all (admin) or filter by their spots (council)
    else if (req.user.role === 'council') {
      // Get all spots owned by this council
      const spots = await ParkingSpot.find({ ownerId: req.user.id });
      const spotIds = spots.map(spot => spot._id);
      query.spotId = { $in: spotIds };
    }
    // Admin gets all bookings
    
    const bookings = await Booking.find(query)
      .populate('userId', 'name email phone')
      .populate('spotId', 'name location address')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('spotId', 'name location address coordinates');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check authorization
    if (req.user.role === 'user' && booking.userId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }
    
    if (req.user.role === 'council') {
      const spot = await ParkingSpot.findById(booking.spotId);
      if (!spot || spot.ownerId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this booking'
        });
      }
    }
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { spotId, vehicleNumber, vehicleType, startTime, endTime } = req.body;
    
    // Validate required fields
    if (!spotId || !vehicleNumber || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide spotId, vehicleNumber, startTime, and endTime'
      });
    }
    
    // Check if spot exists and is available
    const spot = await ParkingSpot.findById(spotId);
    if (!spot) {
      return res.status(404).json({
        success: false,
        message: 'Parking spot not found'
      });
    }
    
    if (!spot.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This parking spot is currently inactive'
      });
    }
    
    // Calculate duration in hours
    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = Math.ceil((end - start) / (1000 * 60 * 60));
    
    if (duration < 1) {
      return res.status(400).json({
        success: false,
        message: 'Booking duration must be at least 1 hour'
      });
    }
    
    if (duration > spot.maxStay) {
      return res.status(400).json({
        success: false,
        message: `Maximum stay is ${spot.maxStay} hours`
      });
    }
    
    // Check if spot has enough available spaces
    if (spot.availableSpots < 1) {
      return res.status(400).json({
        success: false,
        message: 'No available spaces at this location'
      });
    }
    
    // Calculate total amount
    let totalAmount = 0;
    // Check if booking falls within free windows
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][start.getDay()];
    const freeWindow = spot.freeWindows?.[dayOfWeek];
    const isFree = spot.isFree || (freeWindow && freeWindow.isFree);
    
    if (!isFree) {
      totalAmount = duration * spot.hourlyRate;
    }
    
    // Create booking
    const booking = await Booking.create({
      userId: req.user.id,
      spotId: spot._id,
      spotName: spot.name,
      vehicleNumber: vehicleNumber.toUpperCase(),
      vehicleType: vehicleType || 'car',
      startTime: start,
      endTime: end,
      duration: duration,
      totalAmount: totalAmount,
      status: totalAmount === 0 ? 'confirmed' : 'pending',
      paymentStatus: totalAmount === 0 ? 'paid' : 'pending'
    });
    
    // Decrease available spots
    spot.availableSpots -= 1;
    await spot.save();
    
    // Create notification for user
    await Notification.create({
      userId: req.user.id,
      type: 'booking_confirmation',
      title: 'Booking Created',
      message: `Your booking at ${spot.name} has been created. ${totalAmount > 0 ? 'Please complete payment.' : 'Free parking confirmed!'}`,
      bookingId: booking._id
    });
    
    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Update booking status (confirm/cancel)
// @route   PATCH /api/bookings/:id/status
// @access  Private
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Only user who created the booking can cancel
    if (req.user.role === 'user' && booking.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }
    
    // Only admin/council can confirm
    if (status === 'confirmed' && !['admin', 'council'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only admin or council can confirm bookings'
      });
    }
    
    // If cancelling, increase available spots
    if (status === 'cancelled' && booking.status !== 'cancelled') {
      const spot = await ParkingSpot.findById(booking.spotId);
      if (spot) {
        spot.availableSpots += 1;
        await spot.save();
      }
    }
    
    booking.status = status;
    if (status === 'cancelled') {
      booking.cancelledAt = Date.now();
      booking.cancellationReason = req.body.reason || 'User cancelled';
    }
    await booking.save();
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update payment status (for Stripe integration)
// @route   PATCH /api/bookings/:id/payment
// @access  Private
router.patch('/:id/payment', protect, async (req, res) => {
  try {
    const { paymentStatus, paymentId } = req.body;
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Only user who created the booking can update payment
    if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update payment'
      });
    }
    
    booking.paymentStatus = paymentStatus;
    if (paymentId) booking.paymentId = paymentId;
    if (paymentStatus === 'paid') booking.status = 'confirmed';
    await booking.save();
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete booking (Admin only)
// @route   DELETE /api/bookings/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Restore available spots if booking wasn't cancelled
    if (booking.status !== 'cancelled') {
      const spot = await ParkingSpot.findById(booking.spotId);
      if (spot) {
        spot.availableSpots += 1;
        await spot.save();
      }
    }
    
    await booking.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;