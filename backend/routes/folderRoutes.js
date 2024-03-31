const express = require('express');
const router = express.Router();
const folderController = require('../controllers/folderController');

router.post('/create', folderController.createFolder);
router.get('/get/:id', folderController.getFolderById);
router.put('/update/:id', folderController.updateFolder);
router.delete('/delete/:id', folderController.deleteFolder);
// router.put('/:id', folderController.updateFolderName);
router.get('/contents', folderController.getDirectoryContents);
router.post('/move', folderController.moveItem);
// router.delete('/:id', folderController.deleteFolder);

module.exports = router;
