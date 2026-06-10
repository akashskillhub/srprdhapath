const PracticeSubject = require('./subject.model');
const PracticeChapter = require('./chapter.model');

// SUBJECT CRUD
exports.getSubjects = async (req, res) => {
    try {
        const subjects = await PracticeSubject.find().sort({ createdAt: -1 });
        res.json(subjects);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching subjects', error: err.message });
    }
};

exports.createSubject = async (req, res) => {
    try {
        const { name, icon, color } = req.body;
        const subject = new PracticeSubject({ name, icon, color });
        await subject.save();
        res.status(201).json(subject);
    } catch (err) {
        res.status(500).json({ message: 'Error creating subject', error: err.message });
    }
};

exports.updateSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, icon, color } = req.body;
        const subject = await PracticeSubject.findByIdAndUpdate(id, { name, icon, color }, { new: true });
        res.json(subject);
    } catch (err) {
        res.status(500).json({ message: 'Error updating subject', error: err.message });
    }
};

exports.deleteSubject = async (req, res) => {
    try {
        const { id } = req.params;
        await PracticeChapter.deleteMany({ subjectId: id });
        await PracticeSubject.findByIdAndDelete(id);
        res.json({ message: 'Subject and its chapters removed successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting subject', error: err.message });
    }
};

// CHAPTER CRUD
exports.getChaptersBySubject = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const chapters = await PracticeChapter.find({ subjectId }).sort({ createdAt: -1 });
        res.json(chapters);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching chapters', error: err.message });
    }
};

exports.createChapter = async (req, res) => {
    try {
        const { name, subjectId } = req.body;
        const chapter = new PracticeChapter({ name, subjectId });
        await chapter.save();
        res.status(201).json(chapter);
    } catch (err) {
        res.status(500).json({ message: 'Error creating chapter', error: err.message });
    }
};

exports.updateChapter = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const chapter = await PracticeChapter.findByIdAndUpdate(id, { name }, { new: true });
        res.json(chapter);
    } catch (err) {
        res.status(500).json({ message: 'Error updating chapter', error: err.message });
    }
};

exports.deleteChapter = async (req, res) => {
    try {
        const { id } = req.params;
        await PracticeChapter.findByIdAndDelete(id);
        res.json({ message: 'Chapter removed successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting chapter', error: err.message });
    }
};
