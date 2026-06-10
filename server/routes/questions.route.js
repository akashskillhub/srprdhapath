const express = require('express');
const router = express.Router();
const Question = require('../model/Question');

// Search for questions by folderId, subjectId, yearId or simply all
router.get('/', async (req, res) => {
  try {
    const { folderId, subjectId, yearId } = req.query;
    const filter = {};
    if (folderId && folderId !== 'ALL') filter.folderId = folderId;
    if (subjectId) filter.subjectId = subjectId;
    if (yearId) filter.yearId = yearId;

    const questions = await Question.find(filter).sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
