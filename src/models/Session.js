import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pack: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pack',
    required: true
  },
  sessionDate: {
    type: Date,
    required: true
  },
  sessionTime: {
    type: String, // Store as 'HH:mm' (e.g., '14:30' for 2:30 PM)
    required: true
  },
  location: {
    type: String, // Example: 'Gym A, Room 2' or 'Online (Zoom)'
    required: true
  },
   duration: {
    type: Number, // Duration in minutes
    default: 60 // Default duration set to 1 hour (60 minutes)
  },
  sessionStatus: {
    type: String,
    enum: ['finished', 'upcoming', 'pending'],
    default: 'upcoming'
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'canceled'],
    default: 'scheduled'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Session || mongoose.model('Session', SessionSchema);
