const fs = require('fs');
const fsUp = require('fs').promises;
const path = require('path');
const multer = require('multer');

const uploadsDir = path.join(__dirname, './uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}


// Set up storage engine with multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,  './uploads'); // Ensure this directory exists or is created dynamically
  },
  filename: function (req, file, cb) {
    // Using the original file name; consider generating a unique name to avoid overwrites
    cb(null, ` ${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// Function to handle file upload
exports.uploadFile = upload.single('file'); // Middleware for single file upload

exports.handleUpload = async (req, res) => {
  if (!req.file) {
    return res.status(400).send('Please upload a file.');
  }

  // Extracting additional metadata from the request, assuming they are provided.
  // You might need to adjust based on where this data comes from (e.g., request body, authenticated user session, etc.)
  const { folder_id, ownerUserId, departmentId, fileType } = req.body;
  const { originalname, mimetype, path } = req.file;
  console.log(originalname,path)
  // const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const currentTime = new Date()
// console.log(currentTime)
  try {
    const sql = `
      INSERT INTO files (FileName, FilePath, FolderID, Created, OwnerUserID, DepartmentId, LastRevised, FileType)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    // Note: Assuming 'mimetype' from the uploaded file should be stored in 'FileType'
    // Adjust if 'fileType' should come from somewhere else
    await req.db.query(sql, [
      originalname, 
      path, 
      folder_id, 
      currentTime, 
      ownerUserId, 
      departmentId, 
      currentTime, // Assuming 'LastRevised' is set to the current time on creation
      fileType || mimetype // Use provided 'fileType' or fallback to 'mimetype'
    ]);
    const updateFolderSql = 'UPDATE folders SET LastRevised = ? WHERE FolderID = ?';
await req.db.query(updateFolderSql, [currentTime, folder_id]);
    console.log('File uploaded to database');
    res.send('File uploaded successfully.');
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send('Error uploading file');
  }
};


  
//   exports.updateFolder = async (req, res) => {
//     try {
//         const { id } = req.params; // The ID of the folder to update
//         const { name } = req.body; // The new name for the folder
//         // Update only the name column for the folder with the specified ID
//         const [result] = await req.db.query('UPDATE folders SET name = ? WHERE id = ?', [name, id]);
        
//         // Check if the folder was found and updated
//         if (result.affectedRows === 0) {
//             return res.status(404).json({ message: 'Folder not found' });
//         }
        
//         // Respond with the updated folder details
//         res.status(200).json({ id, name });
//     } catch (error) {
//         // Handle any errors during the database operation
//         res.status(500).json({ message: error.message });
//     }
// };
exports.updateFileName = async (req, res) => {
  const { id } = req.params;
  const { newName } = req.body;

  if (!newName) {
      return res.status(400).send('New file name is required.');
  }

  try {
      // First, retrieve the current filename and its path from the database
      const [rows] = await req.db.query('SELECT FilePath, FileName FROM files WHERE FileID = ?', [id]);
      if (rows.length === 0) {
          return res.status(404).send('File not found.');
      }
     
      
      const oldFilePath = rows[0].FilePath.trim();
      console.log(`Old FilePath: ${oldFilePath}`);
      
      // Extract the prefix from the FilePath
      const prefixMatch = oldFilePath.match(/[\d]+-/);
      const prefix = prefixMatch ? prefixMatch[0] : '';
      console.log(`Prefix: ${prefix}`);
      
      // Assuming newName is defined somewhere in your code
      // And you want to keep the extension from the original file name
      const oldFileName = rows[0].FileName.trim();
      const fileExtension = oldFileName.substring(oldFileName.lastIndexOf('.'));
      console.log(`File Extension: ${fileExtension}`);
      
      // Combine the prefix, newName, and the original file extension
      const newFileName = `${newName}${fileExtension}`; 
      console.log(`New FileName: ${newFileName}`);
      
      // If you need the directory path separate from the prefix
      const directoryPath = oldFilePath.substring(0, oldFilePath.indexOf(prefix));
      console.log(`Directory Path: ${directoryPath}`);
      
      // Construct the new file path
      const newFilePath = `${directoryPath}${newFileName}`; 
      console.log(`New FilePath: ${newFilePath}`);
      
        await fsUp.rename(oldFilePath, newFilePath);
      // // Update only the FileName in the database, leave FilePath unchanged if it's not needed
      const sql = 'UPDATE files SET FileName = ?, FilePath=? WHERE FileID = ?';
      await req.db.query(sql, [newFileName,newFilePath, id]);

      console.log('File name updated in database and filesystem');
      res.send('File name updated successfully.');
  } catch (error) {
      console.error('Error updating file name:', error);
      res.status(500).send('Error updating file name');
  }
};

 
exports.deleteFile = async (req, res) => {
  const { id } = req.params;

  try {
    // Retrieve the filepath from the database
    const [rows] = await req.db.query('SELECT FilePath FROM files WHERE FileID = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).send('File not found.');
    }

    const filePath = rows[0].FilePath;
    console.log(filePath);
    // Attempt to delete the file from the filesystem
    try {
      await fsUp.unlink(filePath);
      console.log(`File ${filePath} deleted from filesystem.`);
    } catch (error) {
      // Log the error but decide to proceed with the database record deletion
      // This handles the case where the file might already have been deleted or is inaccessible
      console.error('Error deleting file from filesystem:', error);
    }

    // Remove the file's record from the database
    const [deleteResult] = await req.db.query('DELETE FROM files WHERE FileID = ?', [id]);
    if (deleteResult.affectedRows === 0) {
      // This case is less likely due to earlier checks but included for completeness
      return res.status(404).send('File record not found or already deleted.');
    }

    res.send('File deleted successfully.');
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).send(`Error deleting file: ${error.message}`);
  }
};

  
