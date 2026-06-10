const Question = require('../model/Question');
const Note = require('../model/Note');
const Newspaper = require('../model/Newspaper');
const User = require('../model/User');
const SolvedQuestion = require('../model/SolvedQuestion');

// Question Management
exports.addQuestion = async (req, res) => {
  try {
    const data = { ...req.body };

    if (typeof data.options === 'string') {
      try {
        data.options = JSON.parse(data.options);
      } catch (e) {
        console.error('Failed to parse options JSON', e);
      }
    }

    if (data.questionText) {
      data.title = data.questionText;
    }

    if (!data.type) {
      data.type = 'PYQ';
    }

    if (!data.subject) {
      data.subject = 'General';
    }

    if (data.correctAnswer !== undefined && Array.isArray(data.options) && typeof data.options[0] === 'string') {
      const correctIdx = parseInt(data.correctAnswer);
      data.options = data.options.map((opt, idx) => ({
        text: opt,
        isCorrect: idx === correctIdx
      }));
    }

    if (data.explanationText) {
      data.explanation = { text: data.explanationText };
    }

    if (req.files) {
      if (req.files.questionImage) {
        data.imageUrl = `/uploads/${req.files.questionImage[0].filename}`;
      }
      if (req.files.explanationImage) {
        if (!data.explanation) data.explanation = {};
        data.explanation.image = `/uploads/${req.files.explanationImage[0].filename}`;
      }
    }

    // Clean up optional fields if empty or the string 'undefined'
    if (data.subjectId === 'undefined' || !data.subjectId) delete data.subjectId;
    if (data.yearId === 'undefined' || !data.yearId) delete data.yearId;
    
    // Ensure explanation is thoroughly optional
    if (!data.explanation?.text && !data.explanation?.image) {
      delete data.explanation;
    }

    const question = new Question(data);
    await question.save();
    res.status(201).json({ success: true, data: question });
  } catch (error) {
    console.error('Add question error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const data = { ...req.body };
    const { id } = req.params;

    const existingQuestion = await Question.findById(id);
    if (!existingQuestion) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    if (typeof data.options === 'string') {
      try {
        data.options = JSON.parse(data.options);
      } catch (e) {
        console.error('Failed to parse options JSON', e);
      }
    }

    if (data.questionText) {
      data.title = data.questionText;
    }

    if (data.correctAnswer !== undefined && Array.isArray(data.options) && typeof data.options[0] === 'string') {
      const correctIdx = parseInt(data.correctAnswer);
      data.options = data.options.map((opt, idx) => ({
        text: opt,
        isCorrect: idx === correctIdx
      }));
    }

    // Merge existing explanation fields to prevent data loss
    const explanation = { ...(existingQuestion.explanation || {}) };
    if (data.explanationText !== undefined) {
      explanation.text = data.explanationText;
    }

    if (req.files) {
      if (req.files.questionImage) {
        data.imageUrl = `/uploads/${req.files.questionImage[0].filename}`;
      }
      if (req.files.explanationImage) {
        explanation.image = `/uploads/${req.files.explanationImage[0].filename}`;
      }
    }

    if (explanation.text || explanation.image) {
      data.explanation = explanation;
    }

    const question = await Question.findByIdAndUpdate(id, data, { new: true });
    res.status(200).json({ success: true, data: question });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getQuestions = async (req, res) => {
  try {
    const questions = await Question.find();
    res.status(200).json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Question deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Note Management (Current Affairs)
exports.addNote = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.image = `/uploads/${req.file.filename}`;
    }
    const note = new Note(data);
    await note.save();
    res.status(201).json({ success: true, data: note });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find().sort({ date: -1 });
    res.status(200).json({ success: true, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Newspaper Management
exports.addNewspaper = async (req, res) => {
  try {
    const newspaper = new Newspaper(req.body);
    await newspaper.save();
    res.status(201).json({ success: true, data: newspaper });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getNewspapers = async (req, res) => {
  try {
    const newspapers = await Newspaper.find().sort({ order: 1 });
    res.status(200).json({ success: true, data: newspapers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Note deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    if (req.file) {
      data.image = `/uploads/${req.file.filename}`;
    }
    const note = await Note.findByIdAndUpdate(id, data, { new: true });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    res.status(200).json({ success: true, data: note });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteNewspaper = async (req, res) => {
  try {
    await Newspaper.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Newspaper deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Student Management
exports.getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).sort({ createdAt: -1 });
    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateStudentStatus = async (req, res) => {
  try {
    const { isPaid, plan } = req.body;
    const student = await User.findByIdAndUpdate(
      req.params.id,
      { isPaid, plan },
      { new: true }
    );
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllProgress = async (req, res) => {
  try {
    const progress = await SolvedQuestion.aggregate([
      {
        $group: {
          _id: "$userId",
          totalSolved: { $sum: 1 },
          correctCount: { $sum: { $cond: ["$isCorrect", 1, 0] } }
        }
      }
    ]);
    res.json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
