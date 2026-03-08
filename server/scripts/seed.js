require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('../src/models/User');
const Mess = require('../src/models/Mess');
const MenuItem = require('../src/models/MenuItem');
const Staff = require('../src/models/Staff');
const WasteLog = require('../src/models/WasteLog');
const Feedback = require('../src/models/Feedback');
const Inventory = require('../src/models/Inventory');
const EnergyLog = require('../src/models/EnergyLog');

const SALT_ROUNDS = 12;

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Idempotent: clear existing demo data
  await Promise.all([
    User.deleteMany({ email: { $in: ['ravi@mess.edu', 'priya@mess.edu', 'arjun@student.edu', 'sneha@student.edu'] } }),
  ]);

  // Create Staff users
  const hashedStaff = await bcrypt.hash('staff123', SALT_ROUNDS);
  const hashedStaff2 = await bcrypt.hash('staff456', SALT_ROUNDS);
  const hashedStu = await bcrypt.hash('stu123', SALT_ROUNDS);
  const hashedStu2 = await bcrypt.hash('stu456', SALT_ROUNDS);

  const staffUser1 = await User.create({
    name: 'Ravi Kumar', email: 'ravi@mess.edu', password: hashedStaff,
    role: 'staff', isSetupComplete: false,
  });

  const staffUser2 = await User.create({
    name: 'Priya Sharma', email: 'priya@mess.edu', password: hashedStaff2,
    role: 'staff', isSetupComplete: false,
  });

  // Create Mess
  let mess = await Mess.findOne({ name: 'Hostel H4 Mess' });
  if (!mess) {
    mess = await Mess.create({
      name: 'Hostel H4 Mess', capacity: 500, established: 2010,
      phone: '9876543210', address: 'Hostel H4, IIT Campus, Chennai - 600036',
      adminUserId: staffUser1._id, isActive: true,
    });
  }

  // Update users with messId and mark setup complete
  await User.updateMany(
    { _id: { $in: [staffUser1._id, staffUser2._id] } },
    { messId: mess._id, isSetupComplete: true }
  );

  // Create Students
  const student1 = await User.create({
    name: 'Arjun Mehta', email: 'arjun@student.edu', password: hashedStu,
    role: 'student', messId: mess._id, rollNo: 'CS21B001', year: 3,
  });
  const student2 = await User.create({
    name: 'Sneha Patel', email: 'sneha@student.edu', password: hashedStu2,
    role: 'student', messId: mess._id, rollNo: 'EE21B042', year: 3,
  });

  // Delete existing mess data
  await Promise.all([
    MenuItem.deleteMany({ messId: mess._id }),
    Staff.deleteMany({ messId: mess._id }),
    WasteLog.deleteMany({ messId: mess._id }),
    Feedback.deleteMany({ messId: mess._id }),
    Inventory.deleteMany({ messId: mess._id }),
    EnergyLog.deleteMany({ messId: mess._id }),
  ]);

  // Create Menu Items
  const menuItems = await MenuItem.insertMany([
    { messId: mess._id, name: 'Chole Bhature', category: 'Main Course', ingredients: ['chickpeas', 'flour', 'oil', 'spices'], avgWasteKg: 12, avgRating: 4.2 },
    { messId: mess._id, name: 'Dal Makhani', category: 'Main Course', ingredients: ['black dal', 'butter', 'cream', 'spices'], avgWasteKg: 10, avgRating: 4.5 },
    { messId: mess._id, name: 'Rajma Rice', category: 'Main Course', ingredients: ['rajma', 'rice', 'onion', 'tomato', 'spices'], avgWasteKg: 8, avgRating: 4.3 },
    { messId: mess._id, name: 'Veg Biryani', category: 'Main Course', ingredients: ['basmati rice', 'mixed veggies', 'biryani masala'], avgWasteKg: 9, avgRating: 4.6 },
    { messId: mess._id, name: 'Paneer Butter Masala', category: 'Main Course', ingredients: ['paneer', 'butter', 'tomato', 'cream'], avgWasteKg: 6, avgRating: 4.7 },
    { messId: mess._id, name: 'Idli Sambar', category: 'Breakfast', ingredients: ['idli batter', 'sambar', 'coconut chutney'], avgWasteKg: 4, avgRating: 4.0 },
    { messId: mess._id, name: 'Aloo Paratha', category: 'Breakfast', ingredients: ['potato', 'wheat flour', 'butter', 'spices'], avgWasteKg: 5, avgRating: 4.4 },
    { messId: mess._id, name: 'Pav Bhaji', category: 'Snacks', ingredients: ['mixed veggies', 'pav', 'butter', 'bhaji masala'], avgWasteKg: 7, avgRating: 4.5 },
  ]);

  // Create Staff Members
  const staffMembers = await Staff.insertMany([
    { messId: mess._id, name: 'Ramesh Yadav', role: 'Head Cook', phone: '9876501234', speciality: 'North Indian', since: 2015 },
    { messId: mess._id, name: 'Sunita Devi', role: 'Cook', phone: '9876502345', speciality: 'South Indian', since: 2018 },
    { messId: mess._id, name: 'Mohan Lal', role: 'Cook', phone: '9876503456', speciality: 'Continental', since: 2019 },
    { messId: mess._id, name: 'Geeta Kumari', role: 'Assistant Cook', phone: '9876504567', speciality: 'Desserts', since: 2020 },
    { messId: mess._id, name: 'Suresh Babu', role: 'Store Keeper', phone: '9876505678', speciality: 'Inventory', since: 2017 },
  ]);

  // Create 7 days of waste logs
  const meals = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
  const wasteLogsData = [];
  for (let d = 6; d >= 0; d--) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    for (const meal of meals) {
      const item = menuItems[Math.floor(Math.random() * menuItems.length)];
      const preparedKg = 50 + Math.random() * 100;
      const wastedKg = preparedKg * (0.05 + Math.random() * 0.25);
      wasteLogsData.push({
        messId: mess._id, loggedBy: staffUser1._id, date,
        meal, menuItemId: item._id, menuItemName: item.name,
        preparedKg: parseFloat(preparedKg.toFixed(1)),
        wastedKg: parseFloat(wastedKg.toFixed(1)),
        costLoss: parseFloat((wastedKg * 40).toFixed(2)),
        co2Kg: parseFloat((wastedKg * 2.5).toFixed(2)),
      });
    }
  }
  await WasteLog.insertMany(wasteLogsData);

  // Create Feedback
  const feedbackData = [];
  const students = [student1, student2];
  for (let i = 0; i < 10; i++) {
    const student = students[i % 2];
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(i / 2));
    feedbackData.push({
      messId: mess._id, studentId: student._id, date,
      meal: meals[i % 4],
      overallRating: 3 + Math.floor(Math.random() * 3),
      tasteRating: 3 + Math.floor(Math.random() * 3),
      portionRating: 3 + Math.floor(Math.random() * 3),
      freshnessRating: 3 + Math.floor(Math.random() * 3),
      comment: i % 3 === 0 ? 'Food was great today! Keep it up.' : undefined,
    });
  }
  await Feedback.insertMany(feedbackData);

  // Create Inventory
  const inventoryItems = [
    { name: 'Rice', category: 'Grains', unit: 'kg', qty: 150, minQty: 50, costPerUnit: 45, icon: '🌾' },
    { name: 'Wheat Flour', category: 'Grains', unit: 'kg', qty: 80, minQty: 30, costPerUnit: 35, icon: '🌾' },
    { name: 'Chickpeas', category: 'Legumes', unit: 'kg', qty: 25, minQty: 20, costPerUnit: 90, icon: '🫘' },
    { name: 'Rajma', category: 'Legumes', unit: 'kg', qty: 18, minQty: 15, costPerUnit: 110, icon: '🫘' },
    { name: 'Black Dal', category: 'Legumes', unit: 'kg', qty: 30, minQty: 20, costPerUnit: 120, icon: '🫘' },
    { name: 'Potato', category: 'Vegetables', unit: 'kg', qty: 60, minQty: 25, costPerUnit: 20, icon: '🥔' },
    { name: 'Onion', category: 'Vegetables', unit: 'kg', qty: 40, minQty: 20, costPerUnit: 25, icon: '🧅' },
    { name: 'Tomato', category: 'Vegetables', unit: 'kg', qty: 8, minQty: 15, costPerUnit: 30, icon: '🍅' },
    { name: 'Paneer', category: 'Dairy', unit: 'kg', qty: 12, minQty: 10, costPerUnit: 350, icon: '🧀' },
    { name: 'Butter', category: 'Dairy', unit: 'kg', qty: 5, minQty: 3, costPerUnit: 450, icon: '🧈' },
    { name: 'Salt', category: 'Spices', unit: 'kg', qty: 20, minQty: 5, costPerUnit: 15, icon: '🧂' },
    { name: 'Sugar', category: 'Spices', unit: 'kg', qty: 25, minQty: 10, costPerUnit: 42, icon: '🍬' },
    { name: 'Turmeric', category: 'Spices', unit: 'kg', qty: 3, minQty: 1, costPerUnit: 180, icon: '🌿' },
    { name: 'Red Chilli', category: 'Spices', unit: 'kg', qty: 4, minQty: 2, costPerUnit: 220, icon: '🌶️' },
    { name: 'Cumin', category: 'Spices', unit: 'kg', qty: 2, minQty: 1, costPerUnit: 250, icon: '🌿' },
    { name: 'Mustard Seeds', category: 'Spices', unit: 'kg', qty: 2, minQty: 1, costPerUnit: 180, icon: '🌿' },
    { name: 'Cooking Oil', category: 'Oils', unit: 'L', qty: 40, minQty: 20, costPerUnit: 130, icon: '🫙' },
    { name: 'Large Kadai', category: 'Utensils', unit: 'pcs', qty: 8, minQty: 4, costPerUnit: 1500, icon: '🍳' },
    { name: 'Pressure Cooker', category: 'Utensils', unit: 'pcs', qty: 6, minQty: 3, costPerUnit: 2200, icon: '🍲' },
    { name: 'Steel Plates', category: 'Utensils', unit: 'pcs', qty: 600, minQty: 300, costPerUnit: 80, icon: '🍽️' },
    { name: 'Steel Glasses', category: 'Utensils', unit: 'pcs', qty: 550, minQty: 300, costPerUnit: 50, icon: '🥛' },
    { name: 'Serving Ladles', category: 'Utensils', unit: 'pcs', qty: 20, minQty: 10, costPerUnit: 120, icon: '🥄' },
    { name: 'LPG Gas', category: 'Energy', unit: 'kg', qty: 45, minQty: 30, costPerUnit: 85, icon: '⛽' },
    { name: 'Electricity Units', category: 'Energy', unit: 'kWh', qty: 500, minQty: 100, costPerUnit: 8, icon: '⚡' },
  ];

  await Inventory.insertMany(inventoryItems.map(item => ({ ...item, messId: mess._id })));

  // Create Energy Logs
  for (let d = 6; d >= 0; d--) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const gasKg = 8 + Math.random() * 4;
    const electricityKwh = 120 + Math.random() * 60;
    await EnergyLog.create({
      messId: mess._id, loggedBy: staffUser1._id, date,
      gasKg: parseFloat(gasKg.toFixed(1)),
      electricityKwh: parseFloat(electricityKwh.toFixed(1)),
      gasCost: parseFloat((gasKg * 85).toFixed(2)),
      electricityCost: parseFloat((electricityKwh * 8).toFixed(2)),
    });
  }

  console.log('\n✅ Seed completed successfully!');
  console.log('\n📋 Demo Credentials:');
  console.log('Staff 1: ravi@mess.edu / staff123');
  console.log('Staff 2: priya@mess.edu / staff456');
  console.log('Student 1: arjun@student.edu / stu123');
  console.log('Student 2: sneha@student.edu / stu456');
  console.log(`\nMess ID: ${mess._id}`);

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
