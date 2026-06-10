const Folder = require('../model/Folder');
const Question = require('../model/Question');
const Material = require('../model/Material');
const fs = require('fs');
const path = require('path');

exports.createFolder = async (req, res) => {
  try {
    const { name, parent, category, isFinal } = req.body;
    const folder = new Folder({ name, parent, category, isFinal });
    await folder.save();
    res.status(201).json(folder);
  } catch (err) {
    res.status(500).json({ message: 'Error creating folder', error: err.message });
  }
};

exports.getFolders = async (req, res) => {
  try {
    const { parent, category } = req.query;
    const query = {};
    
    if (parent === 'null' || !parent) {
      query.parent = null;
    } else {
      query.parent = parent;
    }
    
    if (category) {
      query.category = category;
    }
    
    const folders = await Folder.find(query).sort({ createdAt: -1 });
    res.json(folders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching folders', error: err.message });
  }
};

exports.getFolderQuestions = async (req, res) => {
  try {
    const { folderId } = req.params;
    const questions = await Question.find({ 
      $or: [
        { folderId: folderId },
        { subjectId: folderId },
        { yearId: folderId }
      ]
    });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching questions', error: err.message });
  }
};

exports.updateFolder = async (req, res) => {
  try {
    const { name, category, isFinal } = req.body;
    const folder = await Folder.findByIdAndUpdate(
      req.params.id, 
      { name, category, isFinal }, 
      { new: true }
    );
    if (!folder) return res.status(404).json({ message: 'Folder not found' });
    res.json(folder);
  } catch (err) {
    res.status(500).json({ message: 'Error updating folder', error: err.message });
  }
};

exports.deleteFolder = async (req, res) => {
  try {
    const deleteRecursive = async (folderId) => {
      const subfolders = await Folder.find({ parent: folderId });
      for (let sf of subfolders) {
        await deleteRecursive(sf._id);
      }
      
      // Delete associated materials and their uploaded files from disk
      const materials = await Material.find({ subjectId: folderId });
      for (let m of materials) {
        if (m.fileUrl && m.fileUrl.startsWith('/uploads/')) {
          const filePath = path.join(__dirname, '..', m.fileUrl);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
        await m.deleteOne();
      }

      await Folder.findByIdAndDelete(folderId);
      await Question.deleteMany({ folderId });
    };

    const folder = await Folder.findById(req.params.id);
    if (!folder) return res.status(404).json({ message: 'Folder not found' });

    await deleteRecursive(req.params.id);
    res.json({ message: 'Folder and contents deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting folder', error: err.message });
  }
};
