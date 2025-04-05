import mongoose from 'mongoose';

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
  experience: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  specialty: {
    type: String,
    trim: true
  },
  categories: {
    type: [String],
    default: []
  },
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
  provider: {
    type: String
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.User || mongoose.model('User', UserSchema);