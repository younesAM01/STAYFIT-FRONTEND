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
  purchaseDate: {
    type: Date,
    required: true
  },
  packExpirationDate: {
    type: Date,
    required: true
  },
  sessionDay: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
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
    required: true
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
