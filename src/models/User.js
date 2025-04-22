import mongoose from 'mongoose';
const AboutSchema = new mongoose.Schema({
  paragraphs: {
    en: [{ type: String, required: true }],
    ar: [{ type: String, required: true }]
  },
  languages: [{
    code: { type: String, required: true },
    name: { type: String, required: true }
  }]
});

const SpecialtySchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true },
    ar: { type: String, required: true }
  },
  description: {
    en: { type: String, required: true },
    ar: { type: String, required: true }
  }
});

const CertificationSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true },
    ar: { type: String, required: true }
  },
  org: {
    type: String,
    default: ""
  }
});

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  age: {
    type: Number
  },
  address: {
    type: String,
    trim: true
  },
  profilePic: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  supabaseId: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['super admin', 'admin', 'coach', 'client'],
    required: true
  },
  rating: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: {
    type: Number,
    default: 0
  },
  aboutContent: { type: AboutSchema, required: false },
  specialties: [{ type: SpecialtySchema, required: false }],
  certifications: [{ type: CertificationSchema, required: false }],
  hoverImage: {
    type: String,
    trim: true
  },
  title: { 
    ar: { type: String },
    en: { type: String }
  },
  available: {
    en: {
      type: String,
      enum: ['Available only for women', 'Available for all'],
      required: false
    },
    ar: {
      type: String,
      enum: ['متاح للنساء فقط', 'متاح للجميع'],
      required: false
    }
  },
  weight: {
    type: Number
  },
  height: {
    type: Number
  },
  diseases: {
    type: [String],
    default: []
  },
  preferredLanguage: {
    type: String,
    trim: true
  },
  nationality: {
    type: String,
    trim: true
  },
  goals: {
    type: [String],
    default: []
  },
  provider: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
