const express = require('express');
const router = express.Router();
const controller = require('./practice.controller');
const { isAdmin } = require('../../middlewares/auth.middleware');

// Public/Student routes
router.get('/subjects', controller.getSubjects);
router.get('/chapters/:subjectId', controller.getChaptersBySubject);

// Admin-protected routes
router.post('/subjects', isAdmin, controller.createSubject);
router.put('/subjects/:id', isAdmin, controller.updateSubject);
router.delete('/subjects/:id', isAdmin, controller.deleteSubject);

router.post('/chapters', isAdmin, controller.createChapter);
router.put('/chapters/:id', isAdmin, controller.updateChapter);
router.delete('/chapters/:id', isAdmin, controller.deleteChapter);

module.exports = router;
