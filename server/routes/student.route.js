const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { isAuth } = require('../middlewares/auth.middleware');

router.post('/progress', isAuth, studentController.saveProgress);
router.get('/progress', isAuth, studentController.getProgress);
router.get('/questions', isAuth, studentController.getQuestions);

module.exports = router;
