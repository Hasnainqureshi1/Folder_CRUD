CREATE DATABASE file_manager;
USE filemanager;

DROP TABLE folders; 
DROP TABLE files ; 

CREATE TABLE folders (
    FolderID INT AUTO_INCREMENT PRIMARY KEY,
    FolderName VARCHAR(255) NOT NULL,
    
    ParentFolderID INT,
    OwnerUserID INT,
    DepartmentId INT,
    Created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    LastRevised TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ParentFolderID) REFERENCES folders(FolderID) ON DELETE SET 0
);

CREATE TABLE files (
    FileID INT AUTO_INCREMENT PRIMARY KEY,
    FileName VARCHAR(255) NOT NULL,
    FilePath VARCHAR(255) NOT NULL,
    Created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    OwnerUserID INT,
    DepartmentId INT,
    LastRevised TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FileType VARCHAR(255),
    FolderID INT, -- Assuming this is the foreign key to a `folders` table
    FOREIGN KEY (FolderID) REFERENCES folders(FolderID) -- Adjust 'folders(FolderID)' as necessary
);

CREATE TABLE items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    path VARCHAR(255) NOT NULL,
    type ENUM('file', 'folder') NOT NULL,
    file_type VARCHAR(50), -- Added column for file type (e.g., 'doc', 'pdf')
    parent_id INT,
    owner_id INT,
    department_id INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_revised_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES items(id) ON DELETE CASCADE
);

CREATE TABLE file_folder_relationship (
    file_id INT,
    folder_id INT,
    PRIMARY KEY (file_id, folder_id),
    FOREIGN KEY (file_id) REFERENCES files(FileID) ON DELETE CASCADE,
    FOREIGN KEY (folder_id) REFERENCES folders(FolderID) ON DELETE CASCADE
);
