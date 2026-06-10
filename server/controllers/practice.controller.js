const Question = require('../model/Question');

// @desc Get all questions with filters
exports.getAllQuestions = async (req, res) => {
  try {
    const { subject, topic, subTopic, type = 'PRACTICE' } = req.query;
    const query = { type };
    if (subject) query.subject = subject;
    if (topic) query.topic = topic;
    if (subTopic) query.subTopic = subTopic;

    const questions = await Question.find(query).sort({ createdAt: -1 });
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching questions', error: error.message });
  }
};

// @desc Get random questions for practice
exports.getRandomQuestions = async (req, res) => {
  try {
    const { limit = 10, subject } = req.query;
    const match = { type: 'PRACTICE' };
    if (subject) match.subject = subject;

    const questions = await Question.aggregate([
      { $match: match },
      { $sample: { size: parseInt(limit) } }
    ]);
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching random questions', error: error.message });
  }
};

// @desc Create new question (Admin)
exports.createQuestion = async (req, res) => {
  try {
    const newQuestion = new Question(req.body);
    const savedQuestion = await newQuestion.save();
    res.status(201).json(savedQuestion);
  } catch (error) {
    res.status(400).json({ message: 'Error creating question', error: error.message });
  }
};

// @desc Update question (Admin)
exports.updateQuestion = async (req, res) => {
  try {
    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updatedQuestion) return res.status(404).json({ message: 'Question not found' });
    res.status(200).json(updatedQuestion);
  } catch (error) {
    res.status(400).json({ message: 'Error updating question', error: error.message });
  }
};

// @desc Delete question (Admin)
exports.deleteQuestion = async (req, res) => {
  try {
    const deletedQuestion = await Question.findByIdAndDelete(req.params.id);
    if (!deletedQuestion) return res.status(404).json({ message: 'Question not found' });
    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting question', error: error.message });
  }
};
