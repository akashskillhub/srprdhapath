const express = require('express');
const router = express.Router();
const materialController = require('../controllers/material.controller');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `material-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 1024 } // 1GB limit
});

// Consistent with folder.route.js — no middleware (auth handled at app level)
router.post('/', upload.single('file'), materialController.createMaterial);
router.get('/subject/:subjectId', materialController.getMaterialsBySubject);
router.put('/:id', upload.single('file'), materialController.updateMaterial);
router.delete('/:id', materialController.deleteMaterial);

module.exports = router;
