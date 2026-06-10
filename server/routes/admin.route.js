const express = require('express');
const router = express.Router();
const controller = require('../controllers/admin.controller');
const multer = require('multer');
const path = require('path');

// Multer Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });
const cpUpload = upload.fields([
  { name: 'questionImage', maxCount: 1 },
  { name: 'explanationImage', maxCount: 1 }
]);

// Question Management
router.post('/questions', cpUpload, controller.addQuestion);
router.put('/questions/:id', cpUpload, controller.updateQuestion);
router.get('/questions', controller.getQuestions);
router.delete('/questions/:id', controller.deleteQuestion);

// Note Management (Current Affairs)
router.post('/notes', upload.single('image'), controller.addNote);
router.put('/notes/:id', upload.single('image'), controller.updateNote);
router.get('/notes', controller.getNotes);
router.delete('/notes/:id', controller.deleteNote);

// Newspaper Management
router.post('/newspapers', controller.addNewspaper);
router.get('/newspapers', controller.getNewspapers);
router.delete('/newspapers/:id', controller.deleteNewspaper);

// Student Management
router.get('/students', controller.getStudents);
router.patch('/students/:id/status', controller.updateStudentStatus);
router.get('/students/progress', controller.getAllProgress);

module.exports = router;
