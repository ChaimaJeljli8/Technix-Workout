
export const createNotification = async (userId, title, message, type = 'info') => {
  try {
    const notification = new Notification({
      userId,
      title,
      message,
      type,
      createdAt: new Date(),
      read: false
    });
    
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};
