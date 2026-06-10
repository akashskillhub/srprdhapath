const express = require('express');
const router = express.Router();
const Contact = require('../model/Contact');
const { isAuth, isAdmin } = require('../middlewares/auth.middleware');

// @route   POST /api/contacts
// @desc    Submit a contact query
// @access  Public (Optionally associated with authenticated user)
router.post('/', async (req, res) => {
  try {
    const { name, email, message, userId } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and message' });
    }

    const newContact = new Contact({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      user: userId || null
    });

    await newContact.save();
    
    res.status(201).json({
      success: true,
      message: 'Contact query submitted successfully',
      data: newContact
    });
  } catch (err) {
    console.error('Submit contact error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/contacts
// @desc    Get all contact queries
// @access  Private (Admin only)
router.get('/', isAuth, isAdmin, async (req, res) => {
  try {
    const queries = await Contact.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: queries });
  } catch (err) {
    console.error('Get contact queries error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/contacts/:id
// @desc    Delete a contact query
// @access  Private (Admin only)
router.delete('/:id', isAuth, isAdmin, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    
    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (err) {
    console.error('Delete contact query error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
