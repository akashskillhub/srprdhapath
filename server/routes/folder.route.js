const express = require('express');
const router = express.Router();
const folderController = require('../controllers/folder.controller');

// Create folder
router.post('/', folderController.createFolder);

// Get folders by parent
router.get('/', folderController.getFolders);

// Get questions for a folder
router.get('/:folderId/questions', folderController.getFolderQuestions);

// Rename folder / update folder
router.put('/:id', folderController.updateFolder);

// Delete folder (Deep delete questions inside if needed, for now just folder)
router.delete('/:id', folderController.deleteFolder);

module.exports = router;
