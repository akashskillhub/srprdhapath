const PYQCategory = require('./category.model');
const PYQSubject = require('./subject.model');
const PYQYear = require('./year.model');
const PYQQuestion = require('./question.model');
const PYQGroup = require('./group.model');

// ROOT CATEGORIES
exports.initRootCategories = async (req, res) => {
    try {
        const rootCategories = ['ALL QUESTIONS', 'SUBJECT WISE', 'YEAR_WISE'];
        for (let name of rootCategories) {
            await PYQCategory.findOneAndUpdate({ name }, { name }, { upsert: true });
        }
        if (res) res.json({ message: 'Root categories initialized successfully' });
    } catch (err) {
        if (res) res.status(500).json({ message: 'Error initializing categories', error: err.message });
        else console.error('Background init error:', err.message);
    }
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await PYQCategory.find();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching categories', error: err.message });
    }
};

// GENERIC FOLDER MGMT (Handles Subject, Year, and now Group)
exports.updateGenericFolder = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        
        // Subject -> Year -> Group
        let updated = await PYQSubject.findByIdAndUpdate(id, { name }, { new: true });
        if (!updated) updated = await PYQGroup.findByIdAndUpdate(id, { name }, { new: true });
        if (!updated && !isNaN(parseInt(name))) {
            updated = await PYQYear.findByIdAndUpdate(id, { yearValue: parseInt(name) }, { new: true });
        }
        
        if (!updated) return res.status(404).json({ message: 'Folder not found' });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: 'Error updating folder', error: err.message });
    }
};

exports.deleteGenericFolder = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedSubject = await PYQSubject.findByIdAndDelete(id);
        const deletedGroup = deletedSubject ? null : await PYQGroup.findByIdAndDelete(id);
        const deletedYear = (deletedSubject || deletedGroup) ? null : await PYQYear.findByIdAndDelete(id);
        
        if (!deletedSubject && !deletedGroup && !deletedYear) {
            return res.status(404).json({ message: 'Folder not found' });
        }
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting folder', error: err.message });
    }
};

// GROUP management
exports.getGroups = async (req, res) => {
    try {
        const groups = await PYQGroup.find();
        res.json(groups);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching groups', error: err.message });
    }
}

exports.createGroup = async (req, res) => {
    try {
        const { name, color, icon } = req.body;
        const group = new PYQGroup({ name, color, icon });
        await group.save();
        res.status(201).json(group);
    } catch (err) {
        res.status(500).json({ message: 'Error creating group', error: err.message });
    }
}

// SUBJECT
exports.createSubject = async (req, res) => {
    try {
        const { name } = req.body;
        const subject = new PYQSubject({ name });
        await subject.save();
        res.status(201).json(subject);
    } catch (err) {
        res.status(500).json({ message: 'Error creating subject', error: err.message });
    }
};

exports.getSubjects = async (req, res) => {
    try {
        const subjects = await PYQSubject.find();
        res.json(subjects);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching subjects', error: err.message });
    }
};

// YEAR
exports.createYear = async (req, res) => {
    try {
        const { yearValue, groupId } = req.body;
        const year = new PYQYear({ yearValue, groupId });
        await year.save();
        res.status(201).json(year);
    } catch (err) {
        res.status(500).json({ message: 'Error creating year', error: err.message });
    }
};

exports.getYears = async (req, res) => {
    try {
        const { groupId } = req.query;
        const filter = groupId ? { groupId } : {};
        const years = await PYQYear.find(filter).populate('groupId');
        res.json(years);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching years', error: err.message });
    }
};

// QUESTION
exports.createQuestion = async (req, res) => {
    try {
        const { questionText, options, correctAnswer, subjectId, yearId, category, explanationText } = req.body;
        let questionImagePath = null;
        let explanationImagePath = null;
        if (req.files) {
            if (req.files.questionImage) questionImagePath = `/uploads/${req.files.questionImage[0].filename}`;
            if (req.files.explanationImage) explanationImagePath = `/uploads/${req.files.explanationImage[0].filename}`;
        }

        const question = new PYQQuestion({
            question: questionText,
            options: typeof options === 'string' ? JSON.parse(options) : options,
            correctAnswer,
            subjectId: (subjectId && subjectId !== 'null' && subjectId !== 'undefined' && subjectId !== 'ALL') ? subjectId : null,
            yearId: (yearId && yearId !== 'null' && yearId !== 'undefined') ? yearId : null,
            category,
            explanationText,
            questionImage: questionImagePath,
            explanationImage: explanationImagePath
        });
        await question.save();
        res.status(201).json(question);
    } catch (err) {
        res.status(500).json({ message: 'Error creating question', error: err.message });
    }
};

exports.updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { questionText, options, correctAnswer, explanationText } = req.body;
        
        const updateData = {};
        if (questionText) updateData.question = questionText;
        if (options) updateData.options = typeof options === 'string' ? JSON.parse(options) : options;
        if (correctAnswer) updateData.correctAnswer = correctAnswer;
        if (explanationText !== undefined) updateData.explanationText = explanationText;

        if (req.files) {
            if (req.files.questionImage) updateData.questionImage = `/uploads/${req.files.questionImage[0].filename}`;
            if (req.files.explanationImage) updateData.explanationImage = `/uploads/${req.files.explanationImage[0].filename}`;
        }

        const updated = await PYQQuestion.findByIdAndUpdate(id, updateData, { new: true });
        if (!updated) return res.status(404).json({ message: 'Question not found' });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: 'Error updating question', error: err.message });
    }
};

exports.getQuestions = async (req, res) => {
    try {
        const { category, subjectId, yearId, folderId } = req.query;
        let query = {};
        if (folderId && folderId !== 'ALL') {
            query.$or = [{ folderId }, { subjectId: folderId }, { yearId: folderId }];
        } else if (category && category !== 'ALL QUESTIONS') {
            query.category = category;
            if (subjectId) query.subjectId = subjectId;
            if (yearId) query.yearId = yearId;
        }

        if (category === 'ALL QUESTIONS' || folderId === 'ALL') {
            query.category = 'ALL QUESTIONS';
            const count = await PYQQuestion.countDocuments(query);
            const random = Math.floor(Math.random() * Math.max(0, count - 15));
            const questions = await PYQQuestion.find(query).skip(random).limit(15);
            return res.json(questions);
        }

        const questions = await PYQQuestion.find(query);
        res.json(questions);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching questions', error: err.message });
    }
};

exports.deleteQuestion = async (req, res) => {
    try {
        await PYQQuestion.findByIdAndDelete(req.params.id);
        res.json({ message: 'Question removed' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting question' });
    }
}
