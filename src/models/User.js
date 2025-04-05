import mongoose from 'mongoose';
const AboutSchema = new mongoose.Schema({
  paragraphs: [{ type: String, required: true }],
  languages: [{
    code: { type: String, required: true },
    name: { type: String, required: true }
  }]
});

const SpecialtySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true }
});

const HeroSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String, required: true },
  image: { type: String, required: true }
});

const CertificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  org: { type: String, default: "" }
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
  
  // Coach-specific fields
  aboutContent: { type: AboutSchema, required: false },
  specialties: [{ type: SpecialtySchema, required: false }],
  heroContent: { type: HeroSchema, required: false },
  certifications: [{ type: CertificationSchema, required: false }],
  hoverImage: {
    type: String,
    trim: true
  },
  
  // Client-specific fields
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
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.User || mongoose.model('User', UserSchema);