const express = require('express');
const router = express.Router();
const pyqHubController = require('./pyqhub.controller');
const { isAdmin } = require('../../middlewares/auth.middleware');
const multer = require('multer');

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

// ROOT CATEGORIES
router.get('/categories', pyqHubController.getCategories);

// GENERIC FOLDER MGMT (Subject/Year/Group)
router.put('/folders/:id', isAdmin, pyqHubController.updateGenericFolder);
router.delete('/folders/:id', isAdmin, pyqHubController.deleteGenericFolder);

// GROUPS (Dynamic Gat-A, Gat-B, etc.)
router.get('/groups', pyqHubController.getGroups);
router.post('/groups', isAdmin, pyqHubController.createGroup);

// SUBJECTS
router.post('/subjects', isAdmin, pyqHubController.createSubject);
router.get('/subjects', pyqHubController.getSubjects);

// YEARS
router.post('/years', isAdmin, pyqHubController.createYear);
router.get('/years', pyqHubController.getYears);

// QUESTIONS
router.post('/questions', isAdmin, upload.fields([
    { name: 'questionImage', maxCount: 1 },
    { name: 'explanationImage', maxCount: 1 }
]), pyqHubController.createQuestion);
router.get('/questions', pyqHubController.getQuestions);
router.put('/questions/:id', isAdmin, upload.fields([
    { name: 'questionImage', maxCount: 1 },
    { name: 'explanationImage', maxCount: 1 }
]), pyqHubController.updateQuestion);
router.delete('/questions/:id', isAdmin, pyqHubController.deleteQuestion);

module.exports = router;
