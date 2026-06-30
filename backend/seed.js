const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const ParkingSpot = require('./models/ParkingSpot');
const Booking = require('./models/Booking');
const Notification = require('./models/Notification');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB for seeding'))
  .catch(err => console.error('❌ Connection error:', err));

// Sample Users
const users = [
  {
    name: 'John Driver',
    email: 'john.driver@gmail.com',
    password: 'User@123',
    role: 'user',
    phone: '+447700123460',
    address: '23 Baker Street, London W1U 3AE'
  },
  {
    name: 'Emma Thompson',
    email: 'emma.t@outlook.com',
    password: 'User@123',
    role: 'user',
    phone: '+447700123461',
    address: '15 King\'s Road, Chelsea, London SW3 4XP'
  },
  {
    name: 'Westminster Council Parking Dept',
    email: 'parking@westminster.gov.uk',
    password: 'Council@123',
    role: 'council',
    phone: '+447700123457',
    address: 'Westminster City Hall, 64 Victoria St, London SW1E 6QP'
  }
];

// Sample Parking Spots
const parkingSpots = [
  {
    name: 'Westminster Abbey Car Park',
    location: 'Parliament Square',
    address: 'Broad Sanctuary, London SW1P 3JS',
    city: 'London',
    postcode: 'SW1P 3JS',
    coordinates: { lat: 51.4995, lng: -0.1245 },
    ownerId: null, // Will be set after user creation
    totalSpots: 150,
    availableSpots: 45,
    hourlyRate: 3.50,
    dailyRate: 20.00,
    isFree: false,
    freeWindows: {
      monday: { start: '18:30', end: '08:00', isFree: true },
      tuesday: { start: '18:30', end: '08:00', isFree: true },
      wednesday: { start: '18:30', end: '08:00', isFree: true },
      thursday: { start: '18:30', end: '08:00', isFree: true },
      friday: { start: '18:30', end: '08:00', isFree: true },
      saturday: { start: '13:00', end: '08:00', isFree: true },
      sunday: { start: '00:00', end: '23:59', isFree: true }
    },
    maxStay: 4,
    restrictions: ['No return within 1 hour', 'Permit zone M1'],
    amenities: ['CCTV', 'EV Charging', 'Disabled Access', 'Lighting'],
    openingTime: '06:00',
    closingTime: '23:00',
    rating: 4.5,
    totalReviews: 127
  },
  {
    name: 'Manchester Arndale',
    location: 'Market Street',
    address: 'Manchester Arndale, Manchester M4 3AD',
    city: 'Manchester',
    postcode: 'M4 3AD',
    coordinates: { lat: 53.4835, lng: -2.2426 },
    ownerId: null,
    totalSpots: 250,
    availableSpots: 78,
    hourlyRate: 3.00,
    dailyRate: 18.00,
    isFree: false,
    freeWindows: {
      monday: { start: '19:00', end: '08:00', isFree: true },
      tuesday: { start: '19:00', end: '08:00', isFree: true },
      wednesday: { start: '19:00', end: '08:00', isFree: true },
      thursday: { start: '19:00', end: '08:00', isFree: true },
      friday: { start: '19:00', end: '08:00', isFree: true },
      saturday: { start: '00:00', end: '08:00', isFree: true },
      sunday: { start: '00:00', end: '23:59', isFree: true }
    },
    maxStay: 24,
    amenities: ['CCTV', 'EV Charging', 'Covered', 'Height Restriction: 2.1m'],
    openingTime: '24/7',
    closingTime: '24/7',
    rating: 4.7,
    totalReviews: 234
  },
  {
    name: 'FREE - Sainsbury\'s Car Park (Evenings)',
    location: 'Camden Road',
    address: 'Camden Road, London NW1 9AA',
    city: 'London',
    postcode: 'NW1 9AA',
    coordinates: { lat: 51.5485, lng: -0.1385 },
    ownerId: null,
    totalSpots: 200,
    availableSpots: 150,
    hourlyRate: 0,
    dailyRate: 0,
    isFree: true,
    freeWindows: {
      monday: { start: '19:00', end: '08:00', isFree: true },
      tuesday: { start: '19:00', end: '08:00', isFree: true },
      wednesday: { start: '19:00', end: '08:00', isFree: true },
      thursday: { start: '19:00', end: '08:00', isFree: true },
      friday: { start: '19:00', end: '08:00', isFree: true },
      saturday: { start: '13:00', end: '08:00', isFree: true },
      sunday: { start: '00:00', end: '23:59', isFree: true }
    },
    maxStay: 2,
    restrictions: ['Customer parking only 08:00-19:00'],
    amenities: ['Lighting', 'Open 24/7'],
    openingTime: '24/7',
    closingTime: '24/7',
    rating: 4.1,
    totalReviews: 345
  }
];

// Seed function
async function seedDatabase() {
  try {
    // Clear existing data (optional - comment out if you want to keep data)
    await User.deleteMany({});
    await ParkingSpot.deleteMany({});
    await Booking.deleteMany({});
    await Notification.deleteMany({});
    console.log('🗑️ Cleared existing collections');

    // Create users
    const createdUsers = await User.create(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Get council user IDs
    const councilUsers = createdUsers.filter(u => u.role === 'council');
    const regularUsers = createdUsers.filter(u => u.role === 'user');

    // Assign ownerId to parking spots (first council user)
    const ownerId = councilUsers[0]?._id || createdUsers[0]._id;
    
    // Update parking spots with ownerId
    const spotsWithOwners = parkingSpots.map(spot => ({
      ...spot,
      ownerId: ownerId
    }));

    // Create parking spots
    const createdSpots = await ParkingSpot.create(spotsWithOwners);
    console.log(`✅ Created ${createdSpots.length} parking spots`);

    // Create a sample booking
    const sampleBooking = {
      bookingId: 'BK202406230001',
      userId: regularUsers[0]?._id || createdUsers[0]._id,
      spotId: createdSpots[0]._id,
      spotName: createdSpots[0].name,
      vehicleNumber: 'AB12 CDE',
      vehicleType: 'car',
      startTime: new Date(),
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours later
      duration: 2,
      totalAmount: 7.00,
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: 'card'
    };

    const booking = await Booking.create(sampleBooking);
    console.log(`✅ Created 1 sample booking`);

    // Create a sample notification
    const sampleNotification = {
      userId: regularUsers[0]?._id || createdUsers[0]._id,
      type: 'booking_confirmation',
      title: 'Booking Confirmed',
      message: `Your booking at ${createdSpots[0].name} has been confirmed.`,
      bookingId: booking._id
    };

    await Notification.create(sampleNotification);
    console.log(`✅ Created 1 sample notification`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('📊 Collections created:');
    console.log('  - users');
    console.log('  - parkingspots');
    console.log('  - bookings');
    console.log('  - notifications');
    console.log('\n👤 Test Users:');
    console.log('  - john.driver@gmail.com / User@123');
    console.log('  - emma.t@outlook.com / User@123');
    console.log('  - parking@westminster.gov.uk / Council@123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed
seedDatabase();