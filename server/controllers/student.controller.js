const SolvedQuestion = require('../model/SolvedQuestion');
const Question = require('../model/Question');

exports.saveProgress = async (req, res) => {
  try {
    const { results } = req.body; // Array of { questionId, isCorrect, subject, topic, folderId }
    const userId = req.user._id;

    if (!results || !Array.isArray(results)) {
      return res.status(400).json({ success: false, message: 'Invalid results data' });
    }

    const dataToSave = results.map(res => ({
      userId,
      questionId: res.questionId,
      isCorrect: res.isCorrect,
      subject: res.subject,
      topic: res.topic,
      folderId: res.folderId,
      solvedAt: new Date()
    }));

    await SolvedQuestion.insertMany(dataToSave);

    res.json({ success: true, message: 'Progress saved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProgress = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get today's stats
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayStats = await SolvedQuestion.find({
      userId,
      solvedAt: { $gte: startOfToday }
    });

    // Get subject-wise stats
    const stats = await SolvedQuestion.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: { subject: "$subject", topic: "$topic" },
          totalSolved: { $sum: 1 },
          correctCount: { $sum: { $cond: ["$isCorrect", 1, 0] } }
        }
      },
      {
        $project: {
          _id: 0,
          subject: "$_id.subject",
          topic: "$_id.topic",
          totalSolved: 1,
          correctCount: 1
        }
      }
    ]);

    const allSolved = await SolvedQuestion.find({ userId }).select('questionId');
    const solvedQuestionIds = allSolved.map(s => s.questionId.toString());

    res.json({
      todaySolved: todayStats.length,
      todayCorrect: todayStats.filter(s => s.isCorrect).length,
      subjectStats: stats,
      solvedQuestionIds: solvedQuestionIds
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getQuestions = async (req, res) => {
  try {
    const { folderId, type, limit, random } = req.query;
    let query = {};
    
    if (folderId && folderId !== 'ALL' && folderId !== 'null' && folderId !== 'undefined') {
      const mongoose = require('mongoose');
      if (mongoose.Types.ObjectId.isValid(folderId)) {
        query.$or = [
          { folderId: folderId },
          { subjectId: folderId },
          { yearId: folderId }
        ];
      }
    }
    
    if (type) {
      query.type = type;
    }

    let mongoQuery = Question.find(query);

    if (random === 'true') {
      const count = await Question.countDocuments(query);
      const skip = Math.floor(Math.random() * Math.max(0, count - (limit || 20)));
      mongoQuery = mongoQuery.skip(skip).limit(parseInt(limit) || 20);
    } else if (limit) {
      mongoQuery = mongoQuery.limit(parseInt(limit));
    }

    const questions = await mongoQuery;
    res.json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
