const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');

router.post('/upload', fileController.uploadFile, fileController.handleUpload);
router.put('/update/:id', fileController.updateFileName);
router.delete('/delete/:id', fileController.deleteFile);


module.exports = router;