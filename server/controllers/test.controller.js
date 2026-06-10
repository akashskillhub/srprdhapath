const Test = require('../model/Test');
const TestQuestion = require('../model/TestQuestion');

// ── Tests ──────────────────────────────────────────────────────────────────

exports.getTests = async (req, res) => {
  try {
    const { difficulty } = req.query;
    const filter = difficulty ? { difficulty } : {};
    const tests = await Test.find(filter).sort({ createdAt: -1 });
    
    const testsWithCount = await Promise.all(
      tests.map(async (test) => {
        const count = await TestQuestion.countDocuments({ testId: test._id });
        return { ...test.toObject(), questionCount: count };
      })
    );

    res.status(200).json({ success: true, data: testsWithCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createTest = async (req, res) => {
  try {
    const { name, difficulty } = req.body;
    if (!name || !difficulty) {
      return res.status(400).json({ success: false, message: 'Name and difficulty required' });
    }
    const test = await Test.create({ name, difficulty });
    res.status(201).json({ success: true, data: test });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateTest = async (req, res) => {
  try {
    const { name } = req.body;
    const test = await Test.findByIdAndUpdate(req.params.id, { name }, { new: true });
    res.status(200).json({ success: true, data: test });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteTest = async (req, res) => {
  try {
    await TestQuestion.deleteMany({ testId: req.params.id });
    await Test.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Test deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Test Questions ─────────────────────────────────────────────────────────

exports.getQuestions = async (req, res) => {
  try {
    const { testId } = req.params;
    const questions = await TestQuestion.find({ testId }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, data: questions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createQuestion = async (req, res) => {
  try {
    const { testId, question, options, correctAnswer, explanation } = req.body;
    
    let questionImage = '';
    let explanationImage = '';

    if (req.files) {
      if (req.files.questionImage) questionImage = `/uploads/${req.files.questionImage[0].filename}`;
      if (req.files.explanationImage) explanationImage = `/uploads/${req.files.explanationImage[0].filename}`;
    }

    const parsedOptions = typeof options === 'string' ? JSON.parse(options) : options;

    const q = await TestQuestion.create({
      testId,
      question,
      questionImage,
      options: parsedOptions,
      correctAnswer: parseInt(correctAnswer),
      explanation: explanation || '',
      explanationImage,
    });

    res.status(201).json({ success: true, data: q });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const { question, options, correctAnswer, explanation } = req.body;
    const updateData = {
      question,
      options: typeof options === 'string' ? JSON.parse(options) : options,
      correctAnswer: parseInt(correctAnswer),
      explanation: explanation || '',
    };

    if (req.files) {
      if (req.files.questionImage) updateData.questionImage = `/uploads/${req.files.questionImage[0].filename}`;
      if (req.files.explanationImage) updateData.explanationImage = `/uploads/${req.files.explanationImage[0].filename}`;
    }

    const q = await TestQuestion.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.status(200).json({ success: true, data: q });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    await TestQuestion.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
