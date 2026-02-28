require("dotenv").config();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("./connects.js");

const User = require("./schemas/userModel");
const Property = require("./schemas/propertyModel");
const Booking = require("./schemas/bookingModel");

// ─── Default Login Accounts ──────────────────────────────────────────────────
const defaultUsers = [
  {
    name: "Admin",
    email: "admin@rentease.com",
    password: "Admin@123",
    type: "Admin",
  },
  {
    name: "Rahul Sharma",
    email: "owner@rentease.com",
    password: "Owner@123",
    type: "Owner",
    granted: "granted",        // pre-approved by admin so owner can post listings
    phone: 9876543210,
  },
  {
    name: "Priya Renter",
    email: "renter@rentease.com",
    password: "Renter@123",
    type: "Renter",
    phone: 9123456789,
  },
];

// ─── Sample Properties (linked to owner after creation) ──────────────────────
const buildProperties = (ownerId, ownerName) => [
  {
    ownerId,
    ownerName,
    ownerContact: 9876543210,
    propertyType: "Apartment",
    propertyAdType: "Rent",
    propertyAddress: "Flat 3B, Sunshine Residency, Jubilee Hills, Hyderabad - 500033",
    propertyAmt: 18000,
    isAvailable: "Available",
    additionalInfo: "2BHK fully furnished flat. 24/7 security, covered parking, lift available. Near metro station.",
  },
  {
    ownerId,
    ownerName,
    ownerContact: 9876543210,
    propertyType: "House",
    propertyAdType: "Rent",
    propertyAddress: "Plot 12, Green Valley Layout, Banjara Hills, Hyderabad - 500034",
    propertyAmt: 25000,
    isAvailable: "Available",
    additionalInfo: "3BHK independent house with garden. Water tanker facility, power backup. Pet-friendly.",
  },
  {
    ownerId,
    ownerName,
    ownerContact: 9876543210,
    propertyType: "PG",
    propertyAdType: "Rent",
    propertyAddress: "No. 45, Madhapur Main Road, Hyderabad - 500081",
    propertyAmt: 8000,
    isAvailable: "Available",
    additionalInfo: "Boys PG accommodation. WiFi included, meals optional. Walking distance to HITEC City.",
  },
  {
    ownerId,
    ownerName,
    ownerContact: 9876543210,
    propertyType: "Villa",
    propertyAdType: "Rent",
    propertyAddress: "Villa 7, Prestige Gated Community, Gachibowli, Hyderabad - 500032",
    propertyAmt: 55000,
    isAvailable: "Available",
    additionalInfo: "4BHK luxury villa with private pool and garden. Fully furnished, modular kitchen, home theater.",
  },
  {
    ownerId,
    ownerName,
    ownerContact: 9876543210,
    propertyType: "Apartment",
    propertyAdType: "Rent",
    propertyAddress: "Tower C, Aparna Sarovar, Nallagandla, Hyderabad - 500019",
    propertyAmt: 14000,
    isAvailable: "Available",
    additionalInfo: "1BHK semi-furnished. Swimming pool & gym access. Ideal for working professionals.",
  },
];

// ─── Seed Function ────────────────────────────────────────────────────────────
const seed = async () => {
  try {
    await connectDB();
    console.log("\n🌱  Starting database seed...\n");

    // ── 1. Seed Users ──────────────────────────────────────────────────────
    const savedUsers = {};
    for (const userData of defaultUsers) {
      const existing = await User.findOne({ email: userData.email });
      if (existing) {
        console.log(`⏭️   Skipped  (already exists): ${userData.email}`);
        savedUsers[userData.type] = existing;
        continue;
      }
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const newUser = new User({ ...userData, password: hashedPassword });
      await newUser.save();
      savedUsers[userData.type] = newUser;
      console.log(`✅  Created  [${userData.type.padEnd(6)}] ${userData.email}  |  password: ${userData.password}`);
    }

    // ── 2. Seed Properties ─────────────────────────────────────────────────
    const owner = savedUsers["Owner"];
    const existingProps = await Property.countDocuments({ ownerId: owner._id });

    let savedProperties = [];
    if (existingProps > 0) {
      console.log(`\n⏭️   Skipped properties (${existingProps} already exist for this owner)`);
      savedProperties = await Property.find({ ownerId: owner._id });
    } else {
      const propertyData = buildProperties(owner._id, owner.name);
      for (const prop of propertyData) {
        const p = new Property(prop);
        await p.save();
        savedProperties.push(p);
        console.log(`🏠  Property: ${prop.propertyType} at ${prop.propertyAddress.split(",")[0]}  ₹${prop.propertyAmt.toLocaleString()}/mo`);
      }
    }

    // ── 3. Seed Sample Booking ─────────────────────────────────────────────
    const renter = savedUsers["Renter"];
    const existingBooking = await Booking.findOne({ userID: renter._id });

    if (existingBooking) {
      console.log(`\n⏭️   Skipped bookings (already exist for renter)`);
    } else if (savedProperties.length > 0) {
      const sampleBooking = new Booking({
        propertyId: savedProperties[0]._id,
        ownerID: owner._id,
        userID: renter._id,
        userName: renter.name,
        phone: 9123456789,
        bookingStatus: "pending",
      });
      await sampleBooking.save();
      console.log(`\n📅  Booking: ${renter.name} → ${savedProperties[0].propertyType} (Status: Pending)`);
    }

    // ── Summary ────────────────────────────────────────────────────────────
    console.log(`
╔══════════════════════════════════════════════════════╗
║            🏡  RentEase — Default Logins             ║
╠══════════════════════════════════════════════════════╣
║  Role    │ Email                  │ Password         ║
╠══════════════════════════════════════════════════════╣
║  Admin   │ admin@rentease.com     │ Admin@123        ║
║  Owner   │ owner@rentease.com     │ Owner@123        ║
║  Renter  │ renter@rentease.com    │ Renter@123       ║
╚══════════════════════════════════════════════════════╝
`);
  } catch (error) {
    console.error("❌  Seeding failed:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("🔌  Database connection closed.\n");
  }
};

seed();