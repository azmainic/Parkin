const express = require('express');
const router = express.Router();
const ParkingSpot = require('../models/ParkingSpot');
const { protect, authorize } = require('../middleware/auth');

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

// @desc    Get all parking spots with filters
// @route   GET /api/spots
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { city, isFree, minPrice, maxPrice, search } = req.query;
    
    // Build filter object
    const filter = { isActive: true };
    
    if (city) filter.city = city;
    if (isFree === 'true') filter.isFree = true;
    if (isFree === 'false') filter.isFree = false;
    
    // Search by name or location
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      filter.hourlyRate = {};
      if (minPrice) filter.hourlyRate.$gte = parseFloat(minPrice);
      if (maxPrice) filter.hourlyRate.$lte = parseFloat(maxPrice);
    }
    
    const spots = await ParkingSpot.find(filter)
      .populate('ownerId', 'name email phone')
      .sort({ rating: -1 });
    
    res.status(200).json({
      success: true,
      count: spots.length,
      data: spots
    });
  } catch (error) {
    console.error('Get spots error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get parking spots by city
// @route   GET /api/spots/city/:city
// @access  Public
router.get('/city/:city', async (req, res) => {
  try {
    const spots = await ParkingSpot.find({
      city: { $regex: req.params.city, $options: 'i' },
      isActive: true
    }).populate('ownerId', 'name email phone');
    
    res.status(200).json({
      success: true,
      count: spots.length,
      data: spots
    });
  } catch (error) {
    console.error('Get spots by city error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get free parking spots (isFree = true)
// @route   GET /api/spots/free
// @access  Public
router.get('/free', async (req, res) => {
  try {
    const spots = await ParkingSpot.find({
      isFree: true,
      isActive: true
    }).populate('ownerId', 'name email phone');
    
    res.status(200).json({
      success: true,
      count: spots.length,
      data: spots
    });
  } catch (error) {
    console.error('Get free spots error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single parking spot by ID
// @route   GET /api/spots/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const spot = await ParkingSpot.findById(req.params.id)
      .populate('ownerId', 'name email phone address');
    
    if (!spot) {
      return res.status(404).json({
        success: false,
        message: 'Parking spot not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: spot
    });
  } catch (error) {
    console.error('Get spot by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

// @desc    Create a new parking spot (Council/Admin only)
// @route   POST /api/spots
// @access  Private (Council/Admin)
router.post('/', protect, authorize('council', 'admin'), async (req, res) => {
  try {
    // Add ownerId from authenticated user
    req.body.ownerId = req.user.id;
    
    const spot = await ParkingSpot.create(req.body);
    
    res.status(201).json({
      success: true,
      data: spot
    });
  } catch (error) {
    console.error('Create spot error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Update parking spot (Council/Admin only)
// @route   PUT /api/spots/:id
// @access  Private (Council/Admin)
router.put('/:id', protect, authorize('council', 'admin'), async (req, res) => {
  try {
    let spot = await ParkingSpot.findById(req.params.id);
    
    if (!spot) {
      return res.status(404).json({
        success: false,
        message: 'Parking spot not found'
      });
    }
    
    // Check ownership (council can only update their own spots)
    if (req.user.role === 'council' && spot.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this spot'
      });
    }
    
    spot = await ParkingSpot.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: spot
    });
  } catch (error) {
    console.error('Update spot error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update availability (Council/Admin only)
// @route   PATCH /api/spots/:id/availability
// @access  Private (Council/Admin)
router.patch('/:id/availability', protect, authorize('council', 'admin'), async (req, res) => {
  try {
    const { availableSpots } = req.body;
    
    let spot = await ParkingSpot.findById(req.params.id);
    
    if (!spot) {
      return res.status(404).json({
        success: false,
        message: 'Parking spot not found'
      });
    }
    
    // Check ownership
    if (req.user.role === 'council' && spot.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this spot'
      });
    }
    
    if (availableSpots === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide availableSpots'
      });
    }
    
    if (availableSpots > spot.totalSpots) {
      return res.status(400).json({
        success: false,
        message: `Available spots cannot exceed total spots (${spot.totalSpots})`
      });
    }
    
    spot.availableSpots = availableSpots;
    spot.lastUpdated = Date.now();
    await spot.save();
    
    res.status(200).json({
      success: true,
      data: spot
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete parking spot (Admin only)
// @route   DELETE /api/spots/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const spot = await ParkingSpot.findById(req.params.id);
    
    if (!spot) {
      return res.status(404).json({
        success: false,
        message: 'Parking spot not found'
      });
    }
    
    await spot.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Parking spot deleted successfully'
    });
  } catch (error) {
    console.error('Delete spot error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;