import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import Transaction from './models/Transaction.js';
import { ROLES, TRANSACTION_TYPES, CATEGORIES } from './utils/constants.js';

dotenv.config();

/**
 * Seed the database with sample users and transactions.
 * Run: node seed.js
 */

const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@finance.com',
    password: 'admin123',
    role: ROLES.ADMIN,
    isActive: true,
  },
  {
    name: 'Analyst User',
    email: 'analyst@finance.com',
    password: 'analyst123',
    role: ROLES.ANALYST,
    isActive: true,
  },
  {
    name: 'Viewer User',
    email: 'viewer@finance.com',
    password: 'viewer123',
    role: ROLES.VIEWER,
    isActive: true,
  },
];

/**
 * Generate random transactions for the past 6 months.
 */
function generateTransactions(userId, count = 20) {
  const transactions = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 180); // Last 6 months
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);

    const type =
      Math.random() > 0.4 ? TRANSACTION_TYPES.EXPENSE : TRANSACTION_TYPES.INCOME;

    // Pick categories appropriate for the type
    const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Gifts', 'Other'];
    const expenseCategories = [
      'Food', 'Transport', 'Utilities', 'Entertainment', 'Healthcare',
      'Education', 'Shopping', 'Rent', 'Insurance', 'Other',
    ];

    const categoryPool = type === 'income' ? incomeCategories : expenseCategories;
    const category = categoryPool[Math.floor(Math.random() * categoryPool.length)];

    const descriptions = {
      Salary: ['Monthly salary', 'Bonus payment', 'Annual raise'],
      Freelance: ['Web development project', 'Consulting fee', 'Design work'],
      Investment: ['Stock dividend', 'Mutual fund returns', 'Crypto gains'],
      Food: ['Grocery shopping', 'Restaurant dinner', 'Coffee shop', 'Lunch at work'],
      Transport: ['Uber ride', 'Bus pass', 'Fuel', 'Car maintenance'],
      Utilities: ['Electricity bill', 'Water bill', 'Internet bill', 'Phone bill'],
      Entertainment: ['Movie tickets', 'Netflix subscription', 'Concert', 'Gaming'],
      Healthcare: ['Doctor visit', 'Pharmacy', 'Lab tests', 'Insurance premium'],
      Education: ['Online course', 'Books', 'Workshop fee', 'Certification exam'],
      Shopping: ['Clothing', 'Electronics', 'Home decor', 'Gifts'],
      Rent: ['Monthly rent', 'Security deposit'],
      Insurance: ['Health insurance', 'Car insurance', 'Life insurance'],
      Savings: ['Emergency fund', 'Retirement contribution'],
      Gifts: ['Birthday gift received', 'Holiday bonus', 'Cash gift'],
      Other: ['Miscellaneous', 'Refund', 'Cash back'],
    };

    const descPool = descriptions[category] || ['Transaction'];
    const description = descPool[Math.floor(Math.random() * descPool.length)];

    // Income tends to be larger amounts
    const amount =
      type === 'income'
        ? parseFloat((Math.random() * 5000 + 500).toFixed(2))
        : parseFloat((Math.random() * 500 + 10).toFixed(2));

    transactions.push({
      user: userId,
      amount,
      type,
      category,
      date,
      description,
    });
  }

  return transactions;
}

async function seed() {
  try {
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Transaction.deleteMany({});

    // Create users
    console.log('👤 Creating users...');
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = await User.create(userData);
      createdUsers.push(user);
      console.log(`   ✅ ${user.name} (${user.email}) — Role: ${user.role}`);
    }

    // Create transactions for the admin user
    console.log('\n💰 Generating transactions...');
    const adminUser = createdUsers[0];
    const transactions = generateTransactions(adminUser._id, 50);
    await Transaction.insertMany(transactions);
    console.log(`   ✅ Created ${transactions.length} transactions`);

    // Print login credentials
    console.log('\n' + '═'.repeat(50));
    console.log('🔐 Login Credentials:');
    console.log('═'.repeat(50));
    for (const user of sampleUsers) {
      console.log(`   ${user.role.toUpperCase().padEnd(8)} → ${user.email} / ${user.password}`);
    }
    console.log('═'.repeat(50));

    console.log('\n✅ Database seeded successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seed();
