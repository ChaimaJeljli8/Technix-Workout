import express from 'express';
import { ContactMessage } from '../models/ContactMessage.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { isAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Submit contact message (public route, no authentication needed)
router.post('/', async (req, res) => {
  try {
    const message = await ContactMessage.create(req.body);
    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all messages (admin only)
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update message status (admin only)
router.patch('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/read', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await ContactMessage.deleteMany({ status: 'read' });
    res.json({ message: `Deleted ${result.deletedCount} messages` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export { router as contactRoutes };