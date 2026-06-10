const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/test.controller');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `test-${Date.now()}-${file.fieldname}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB per image

// Tests
router.get('/', ctrl.getTests);
router.post('/', ctrl.createTest);
router.put('/:id', ctrl.updateTest);
router.delete('/:id', ctrl.deleteTest);

// Questions
router.get('/:testId/questions', ctrl.getQuestions);
router.post('/questions', upload.fields([
  { name: 'questionImage', maxCount: 1 },
  { name: 'explanationImage', maxCount: 1 },
]), ctrl.createQuestion);
router.put('/questions/:id', upload.fields([
  { name: 'questionImage', maxCount: 1 },
  { name: 'explanationImage', maxCount: 1 },
]), ctrl.updateQuestion);
router.delete('/questions/:id', ctrl.deleteQuestion);

module.exports = router;
