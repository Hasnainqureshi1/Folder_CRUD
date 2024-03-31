// const db = require('../db');
const fsDe = require('fs').promises;

 
const { Console } = require('console');
const path = require('path');
exports.getDirectoryContents = async (req, res) => {
    // Replace 'path' with 'parentFolderId' as a query parameter
    const parentFolderId = req.query.parentFolderId; // This could be `undefined` for the root

    try {
        // Fetch subfolders within the specified folder
        const subfoldersQuery = parentFolderId
            ? 'SELECT * FROM folders WHERE ParentFolderID = ?'
            : 'SELECT * FROM folders WHERE ParentFolderID IS NULL';
        const [subfolders] = await req.db.query(subfoldersQuery, [parentFolderId]);

        // Fetch files within the specified folder
        const filesQuery = 'SELECT * FROM files WHERE FolderID = ?';
        const [files] = await req.db.query(filesQuery, [parentFolderId]);

        // Adjusted to fetch file contents from the backend
        const filesWithContent = await Promise.all(files.map(async (file) => {
            const fileContent = await getFileContent(file.FilePath); // Implement this function based on your file storage
            return { ...file, content: fileContent };
        }));

        // Combine the results
        const directoryContents = {
            parentFolderId: parentFolderId,
            items: [...subfolders.map(folder => ({...folder, type: 'folder'})), 
                    ...filesWithContent.map(file => ({...file, type: 'file'}))]
        };
        
        console.log(files)

        res.status(200).json(directoryContents);
    } catch (error) {
        console.error('Error fetching directory contents:', error);
        res.status(500).send('Error fetching directory contents');
    }
};

// Example helper function to read file content. This is a placeholder and needs to be implemented.
/**
 * Reads the content of a file from the filesystem based on the provided file path.
 * This path should include any naming conventions used when storing the file, such as a timestamp prefix.
 * 
 * @param {string} filePath - The path and name of the file relative to the uploads directory.
 * @returns {Promise<string>} A promise that resolves with the content of the file as a string.
 */
async function getFileContent(filePath) {
    // Construct the full path to the file, assuming 'filePath' is relative to the 'uploads' directory
    
    const fullPath =filePath

    try {
        // Attempt to read the file content as text
        const content = await fsDe.readFile(fullPath, 'utf8');
        return content;
    } catch (error) {
        // Log and re-throw the error if reading the file fails
        console.error(`Failed to read content from file: ${fullPath}`, error);
        throw new Error(`Unable to read content from file: ${filePath}`);
    }
}
async function generateBreadcrumbs(folderId, req) {
    const breadcrumbs = [];
    let currentFolderId = folderId;

    while (currentFolderId) {
        const [folder] = await req.db.query('SELECT FolderID, FolderName, ParentFolderID FROM folders WHERE FolderID = ?', [currentFolderId]);
       
        if (folder) {
            // Prepend to maintain the order from root to current
            breadcrumbs.unshift({ id: folder[0].FolderID, name: folder[0].FolderName });
            
            currentFolderId = folder.ParentFolderID;
        } else {
            break; // Stop if there's no parent (reached the root or an error occurred)
        }
    }
    console.log(breadcrumbs)
    return breadcrumbs;
}

exports.moveItem = async (req, res) => {
    const { itemType, itemId, newParentId } = req.body;
    console.log(itemType,itemId,newParentId)
    try {
        let sql = '';
        if (itemType === 'folder') {
            // For folders, update the ParentFolderID to move it to a new parent folder
            sql = 'UPDATE folders SET ParentFolderID = ? WHERE FolderID = ?';
        } else if (itemType === 'file') {
            // For files, update the FolderID (assuming this is the parent folder ID reference) to move it
            sql = 'UPDATE files SET FolderID = ? WHERE FileID = ?';
        } else {
            return res.status(400).send({ message: 'Invalid item type provided. Must be either "folder" or "file".' });
        }

        await req.db.query(sql, [newParentId, itemId]);
        res.send({ message: `Item moved successfully.` });
    } catch (error) {
        console.error('Error moving item:', error);
        res.status(500).send({ message: 'Error moving item' });
    }
};


exports.createFolder = async (req, res) => {
    // Destructure the request body to extract needed properties
    const { FolderName, ParentFolderID = null, OwnerUserID, DepartmentId } = req.body;

    try {
        const sql = `
            INSERT INTO folders 
            (FolderName, ParentFolderID, OwnerUserID, DepartmentId, Created, LastRevised) 
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;

        // Execute the SQL query to insert the new folder into the database
        const [result] = await req.db.query(sql, [FolderName, ParentFolderID, OwnerUserID, DepartmentId]);
     // Check if there is a parent folder and update its LastRevised time
     const currentTime = new Date()
     if (ParentFolderID) {
        const updateParentFolderSql = 'UPDATE folders SET LastRevised = ? WHERE FolderID = ?';
        await req.db.query(updateParentFolderSql, [currentTime, ParentFolderID]);
        console.log(`Parent folder ${ParentFolderID} Last Revised time updated.`);
    }
        // Respond with a success status and the details of the created folder
        res.status(201).send({
            FolderID: result.insertId,
            FolderName,
            ParentFolderID, // Note: This can be null for root folders
            OwnerUserID,
            DepartmentId,
            Created: new Date(),
            LastRevised: new Date()
        });
    } catch (error) {
        // Log the error and respond with an error status
        console.error('Error creating folder:', error);
        res.status(500).send({ message: error.message });
    }
};

 


exports.getFolderById = async (req, res) => {

    try {
        const { id } = req.params;
        const [rows] = await req.db.query('SELECT * FROM folders WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Folder not found' });
        res.status(200).json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
  
exports.updateFolder = async (req, res) => {
    try {
        const { id } = req.params; // The ID of the folder to update
        const { newName } = req.body; // The new name for the folder
        // Update only the name column for the folder with the specified ID
        const [result] = await req.db.query('UPDATE folders SET FolderName = ? WHERE FolderID = ?', [newName, id]);
        
        // Check if the folder was found and updated
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Folder not found' });
        }
        
        // Respond with the updated folder details
        res.status(200).json({ id, newName });
    } catch (error) {
        // Handle any errors during the database operation
        res.status(500).json({ message: error.message });
    }
};


// exports.deleteFolder = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const [result] = await req.db.query('DELETE FROM folders WHERE id = ?', [id]);
//         if (result.affectedRows === 0) return res.status(404).json({ message: 'Folder not found' });
//         res.status(204).json({message: 'Folder Deleted Successfully'});
//         // res.status(200).json();
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };
// // These functions will delete any and all children of the folder
// async function deleteFilesInFolder(folderId, db) {
//     await db.query('DELETE FROM files WHERE folder_id = ?', [folderId]);
// }

async function deleteFilesInFolder(folderId, db) {
    // Delete files in the current folder
    const [files] = await db.query('SELECT FilePath FROM files WHERE FolderID = ?', [folderId]);
    for (const file of files) {
        try {
            await fsDe.unlink(file.FilePath); // Assuming fs is the Node.js File System module with Promises API
            console.log(`File deleted from filesystem: ${file.FilePath}`);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                throw error; // Throw error if it's not a "file not found" error
            }
        }
    }

    // Delete file records from database
    await db.query('DELETE FROM files WHERE FolderID = ?', [folderId]);
    console.log(`Files in folder ${folderId} deleted from database.`);
}

async function deleteSubfoldersAndFiles(folderId, db) {
    // Recursively delete files and subfolders
    const [subfolders] = await db.query('SELECT FolderID FROM folders WHERE ParentFolderID = ?', [folderId]);
    for (const subfolder of subfolders) {
        await deleteSubfoldersAndFiles(subfolder.FolderID, db); // Recursive call for each subfolder
    }

    // Delete files in the current folder (after dealing with subfolders)
    await deleteFilesInFolder(folderId, db);

    // Delete the current folder from the database
    await db.query('DELETE FROM folders WHERE FolderID = ?', [folderId]);
    console.log(`Folder ${folderId} and its contents have been deleted.`);
}
exports.deleteFolder = async (req, res) => {
    const { id } = req.params; // The ID of the folder to delete

    try {
        // Step 1: Retrieve the ParentFolderID of the folder being deleted
        const getParentSql = 'SELECT ParentFolderID FROM folders WHERE FolderID = ?';
        const [parentRows] = await req.db.query(getParentSql, [id]);
        if (parentRows.length === 0) {
            return res.status(404).send('Folder not found.');
        }
        const parentFolderId = parentRows[0].ParentFolderID;

        // Proceed to delete the folder along with its subfolders and files
        await deleteSubfoldersAndFiles(id, req.db);

        // Step 2: Update the Last Revised timestamp of the parent folder, if it exists
        if (parentFolderId) {
            const currentTime = new Date();
            const updateParentSql = 'UPDATE folders SET LastRevised = ? WHERE FolderID = ?';
            await req.db.query(updateParentSql, [currentTime, parentFolderId]);
            console.log(`Updated Last Revised time of parent folder ID: ${parentFolderId}`);
        }

        res.send('Folder deleted successfully.');
    } catch (error) {
        console.error('Failed to delete folder:', error);
        res.status(500).json({ message: 'Failed to delete folder and its contents.' });
    }
};

