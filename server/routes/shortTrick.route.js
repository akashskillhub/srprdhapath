const express = require('express');
const router = express.Router();
const shortTrickController = require('../controllers/shortTrick.controller');
const multer = require('multer');
const path = require('path');

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Create short trick
router.post('/', upload.single('image'), shortTrickController.createShortTrick);

// Get short tricks by subject
router.get('/subject/:subjectId', shortTrickController.getShortTricksBySubject);

// Update short trick
router.put('/:id', upload.single('image'), shortTrickController.updateShortTrick);

// Delete short trick
router.delete('/:id', shortTrickController.deleteShortTrick);

module.exports = router;
