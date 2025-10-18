import express from 'express';
const router = express.Router();
import { Notification } from '../models/notificationsModel.js';
import { verifyToken } from '../middleware/verifyToken.js';

// Get notifications for the current user
router.get('/notifications', verifyToken, async (req, res) => {
  try {
    let notifications;
    
    if (req.user.role === 'admin') {
      // Admins can see all notifications
      notifications = await Notification.find()
        .sort({ createdAt: -1 })
        .populate('userId', 'name email'); // Add user details
    } else {
      // Regular users only see their own notifications
      notifications = await Notification.find({ userId: req.user._id })
        .sort({ createdAt: -1 });
    }

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
});

// Mark notification as read
router.patch('/notifications/:id/read', verifyToken, async (req, res) => {
  try {
  let query = { _id: req.params.id };
    
  // If not admin, restrict to user's own notifications
  if (req.user.role !== 'admin') {
    query.userId = req.user._id;
  }
  
  const notification = await Notification.findOneAndUpdate(
    query,
    { read: true },
    { new: true }
  );
  
  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }
  
  res.json(notification);
} catch (error) {
  console.error('Error updating notification:', error);
  res.status(500).json({ message: 'Error updating notification', error: error.message });
}
});

// Clear read notifications
router.delete('/notifications/clear', verifyToken, async (req, res) => {
  try {
    let query = { read: true };
    
    // If not admin, restrict to user's own notifications
    if (req.user.role !== 'admin') {
      query.userId = req.user._id;
    }
    
    const result = await Notification.deleteMany(query);
    
    res.json({ 
      message: 'Read notifications cleared',
      count: result.deletedCount 
    });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ message: 'Error clearing notifications', error: error.message });
  }
});

export { router as notificationsRoutes };