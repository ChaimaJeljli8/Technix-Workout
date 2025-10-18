import mongoose from 'mongoose';
const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },  
  title: {
        type: String,
        required: true
      },
      type: { 
        type: String, 
        enum: ['signup', 'update','login', 'add'], 
        required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
    
});

export const Notification = mongoose.model('Notification', NotificationSchema);
