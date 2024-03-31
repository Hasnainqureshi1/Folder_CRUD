import React, { useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone';
import { IoIosDocument } from "react-icons/io";
import { FaFolder } from "react-icons/fa";
import { CiFolderOn } from "react-icons/ci";
import { CiEdit } from "react-icons/ci";
import { MdOutlineDelete } from "react-icons/md";
import CSVIcon from '../assets/CSVIcon.png'
import DocIcon from '../assets/DocIcon.png'
import FolderIcon from '../assets/FolderIcon.png'
import PDFIcon from '../assets/PDFIcon.png'
import XLSIcon from '../assets/XLSIcon.png'
import { useNavigate, useLocation } from 'react-router-dom';
import { useBreadcrumb } from '../Context/BreadcrumbContext';

const staticData = {
    columnsV1: [
      { header: "Type", dataKey: "type" },
      { header: "Name", dataKey: "name" },
      { header: "Created Date", dataKey: "createdDate" },
      { header: "Revised", dataKey: "revised" },
      { header: "Owner", dataKey: "Owner" },
      { header: "Department", dataKey: "Department" },
      
    
      { header: "Actions", dataKey: "click" },
    ],
    
};

 




export default function Home() {
    const navigate = useNavigate();
    const location = useLocation();
    const [breadcrumbs, setBreadcrumbs] = useState([{ name: 'Home', folderId: null }]);
    const { addBreadcrumb,fetchDirectoryContents,directoryContents } = useBreadcrumb();
    // State to manage modal visibility
const [isModalOpen, setIsModalOpen] = useState(false);
// State to manage the current item being edited
const [currentItem, setCurrentItem] = useState({ type: '', id: '', name: '' });

    // const [directoryContents, setDirectoryContents] = useState({ parentFolderId: null, items: [] });
    const [currentFolderId, setcurrentFolderId] = useState()

    function getCurrentFolderIdFromBreadcrumbs() {
      const savedBreadcrumbs = localStorage.getItem('breadcrumbs');
      const breadcrumbs = savedBreadcrumbs ? JSON.parse(savedBreadcrumbs) : null;
      return (breadcrumbs && breadcrumbs.length > 0) ? breadcrumbs[breadcrumbs.length - 1].folderId : null;
  }
  
    useEffect(() => {
      // Attempt to retrieve breadcrumbs from localStorage
      const savedBreadcrumbs = localStorage.getItem('breadcrumbs');
      const breadcrumbs = savedBreadcrumbs ? JSON.parse(savedBreadcrumbs) : null;
    
      if (breadcrumbs && breadcrumbs.length > 0) {
        // Extract the folder ID of the last breadcrumb, assuming it represents the current directory
        const currentFolderId = breadcrumbs[breadcrumbs.length - 1].folderId;
        // Fetch contents for the current folder based on the last breadcrumb's folder ID
        fetchDirectoryContents(currentFolderId);
      } else {
        // If no breadcrumbs are found in localStorage, optionally fetch root directory contents
        // You can pass null or an appropriate identifier for the root directory
        fetchDirectoryContents(null);
      }
    }, []);
 let isFetching = false;   
 // Debounce function to limit how quickly handleFolderClick can be called
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    const later = () => {
      clearTimeout(timeout);
      func.apply(this, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
const handleFolderClick = (folder) => {
  // Prevent executing if a fetch is already in progress
  if (isFetching) return;
  
  isFetching = true; // Set flag to indicate fetch is in progress
  
  // Fetch contents of the clicked folder
  fetchDirectoryContents(folder.FolderID)
    .then(() => {
      addBreadcrumb(folder.FolderName || folder.name, folder.FolderID);
    })
    .catch((error) => {
      console.error('Failed to fetch directory contents:', error);
    })
    .finally(() => {
      isFetching = false; // Reset flag after fetch completes
    });
};

// Wrap your handler with debounce to limit its execution
const debouncedHandleFolderClick = debounce(handleFolderClick, 300); // Adjust the delay as needed

    
    const data = staticData;// Assume staticData is available in this scope
    const [isOutsideDrop, setIsOutsideDrop] = useState(false);
    const [checkedRows, setCheckedRows] = useState([]);
    const [draggedOverRow, setDraggedOverRow] = useState(null);

    const handleCheckboxChange = (event, index) => {
      const updatedCheckedRows = event.target.checked
          ? [...checkedRows, index]
          : checkedRows.filter((checkedIndex) => checkedIndex !== index);
      setCheckedRows(updatedCheckedRows);
  };
    
 
  const handleDelete = async () => {
    // Loop through checked rows to determine if they are files or folders
    const itemsToDelete = checkedRows.map(index => directoryContents.items[index]);

    // Separate items by type for potential different handling
    const filesToDelete = itemsToDelete.filter(item => item.type === 'file');
    const foldersToDelete = itemsToDelete.filter(item => item.type === 'folder');

    const deleteFileAPI = 'http://localhost:3001/api/files/delete/';
    const deleteFolderAPI = 'http://localhost:3001/api/folders/delete/';

    // Store all deletion promises
    const deletionPromises = [];

    // Collect file deletion promises
    filesToDelete.forEach(file => {
        const promise = fetch(`${deleteFileAPI}${file.FileID}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete file.');
            }
            return response.text().then(text => text ? JSON.parse(text) : {});
        })
        .catch(error => {
            console.error('Error deleting file:', file.FileName, error);
        });
        deletionPromises.push(promise);
    });

    // Collect folder deletion promises
    foldersToDelete.forEach(folder => {
        const promise = fetch(`${deleteFolderAPI}${folder.FolderID}`, {
            method: 'DELETE',
          
        })
        .then(async response => {
          const text = await response.text();
          try {
              return JSON.parse(text);
          } catch {
              if (!response.ok) {
                  throw new Error(text);
              }
              return text;
          }
      })
        .catch(error => {
            console.error('Error deleting folder:', folder.FolderName, error);
        });
        deletionPromises.push(promise);
    });

    // Wait for all deletion promises to complete
    Promise.all(deletionPromises).then(() => {
        console.log("All selected files and folders have been deleted");

        const currentFolderId =      getCurrentFolderIdFromBreadcrumbs()

        // Refresh the directory content after deletion
        fetchDirectoryContents(currentFolderId);

        // Clear checked rows
        setCheckedRows([]);
    }).catch(error => {
        console.error('An error occurred during the deletion process:', error);
    });
};

  

    const handleDragOver = (e, rowIndex = null) => {
      console.log(rowIndex)
      e.preventDefault(); // Prevent the browser's default behavior
      e.stopPropagation();
      // console.log(rowIndex)
      setDraggedOverRow(rowIndex); // Set the current row being dragged over
  };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDraggedOverRow(null); // Reset the dragged over row state when the drag leaves a row
    };
    const handleDragStart = (e, item) => {
      // Initialize variables for id and type
      let id, type;
  
      // Check the item type and set the id based on whether it's a file or folder
      if (item.type === 'file') {
        // If the item is a file, use the fileId property
        id = item.FileID;
        console.log('file id ',item.type)
  
          
          const data = JSON.stringify({ id:item.FileID, type: item.type }); // Example data format
          e.dataTransfer.setData("application/json", data);
          console.log(data)
      } else if (item.type === 'folder') {
          // If the item is a folder, use the FolderID property
          id = item.FolderID;
          type = 'folder'; // Explicitly set the type to 'folder'
          console.log("Dragging a folder with ID:", id);
          const data = JSON.stringify({ id: item.FolderID, type: item.type }); // Example data format
          e.dataTransfer.setData("application/json", data);
      } else {
          // If the item type is not recognized, log an error and return to prevent the drag
          console.error("Unknown item type. Dragging is not allowed.");
          return;
      }
   
  
      // Log the type for debugging purposes
      console.log("Item type:", type);
  };
  
    const handleDrop = async(e, targetRow) => {
      e.preventDefault();
      e.stopPropagation();
      console.log(e.dataTransfer)
      const itemId = e.dataTransfer.getData("application/json");
    
      const files = Array.from(e.dataTransfer.files);

      console.log(itemId.type)
      console.log(targetRow)

      const currentFolderId =      getCurrentFolderIdFromBreadcrumbs()

     console.log("current folder id ,",currentFolderId)
     
         
       
      // Case 1: Moving an existing folder or file
      if (itemId && targetRow) {
          // Moving an item within the directory
          const itemData = JSON.parse(itemId);
          console.log("Item ID:", itemData);
          console.log("Item Type:", itemData.type);
          const NewFolderId =  targetRow.FolderID
          console.log("Item New folder:", NewFolderId);
          // console.log(folderId)
          moveItem(itemData.type,itemData.id,NewFolderId).then(()=>{
            fetchDirectoryContents(currentFolderId);
            setDraggedOverRow(null);

          })
          // const targetFolderId = targetRow.FolderID; // Assuming each row has a FolderID
  
          // Implement your logic here to move the item to the new folder
          // This might involve calling a backend API to update the item's folder
  
      } else if (itemId && !targetRow) {
          // Moving an item but not into a specific folder (perhaps to root or a default location)
          console.log(`Moving item ${itemId} to the root or default location.`);
          alert("Moving item to the root or a default location.");
  
          // Implement similar logic for moving the item to the root or default location
  
      } else if (files.length > 0) {
        const allowedExtensions = /(\.csv|\.doc|\.docs|\.xls|\.xlsx|\.pdf)$/i;

        // Filter files to include only those with allowed extensions
        const filteredFiles = files.filter(file => allowedExtensions.test(file.name));
    
        if (filteredFiles.length === 0) {
            alert("No valid files to upload. Please upload files with the following extensions: .csv, .doc, .docs, .xls, .xlsx, .pdf.");
            return; // Stop execution if no valid files are found
        }

        const fileToUpload = filteredFiles[0];
        const ownerUserId = 4; // Replace with actual value
    const departmentId = 4;
    let folderId;   
    // Case 2: Uploading new files
         if (targetRow) {
    folderId = targetRow.FolderID;
    const folderName = targetRow.name || targetRow.FolderName;
    console.log(`Uploading files to folder "${folderName}". Files:`, files);
  } else {
    folderId = currentFolderId; // Assuming this is defined as the root or default location's ID
    console.log("Uploading files to the root or default location. Files:", files);
  }
  uploadFile(fileToUpload, folderId, ownerUserId, departmentId).then(() => {
    console.log(`File successfully uploaded to folder ID: ${folderId}`);
    fetchDirectoryContents(folderId); // Refresh directory contents after the file upload
  }).catch(error => {
    console.error("Failed to upload file:", error);
  }).finally(() => {
    setDraggedOverRow(null); // Reset the dragged over row state after handling the drop
  });
  setDraggedOverRow(null);
} 
      
      // Reset the dragged over row state after handling the drop
  };
  async function moveItem(itemType, itemId, newParentId) {
    try {
      console.log(itemType)
        const response = await fetch('http://localhost:3001/api/folders/move', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add any other headers like authentication tokens if required
            },
            body: JSON.stringify({
                itemType, // "folder" or "file"
                itemId,   // ID of the item being moved
                newParentId, // ID of the new parent folder
            }),
        });

        const data = await response.json(); // Assuming your server responds with JSON

        if (response.ok) {
            console.log('Success:', data.message);
        
        } else {
            // Handle server-side validation messages or errors
            console.error('Error:', data.message);
            alert(`Error moving item: ${data.message}`);
        }
    } catch (error) {
        console.error('Network or other error:', error);
        alert('Error moving item: Unable to connect to the server.');
    }
}
async  function uploadFile(file, folderId, ownerUserId, departmentId) {
    // Create FormData to send file and additional data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder_id', folderId || ''); // Pass empty string if folderId is null or undefined
    formData.append('ownerUserId', ownerUserId);
    formData.append('departmentId', departmentId);
    formData.append('fileType', file.type); // Assuming you want to send the file's MIME type

    // Perform the fetch request to upload the file
  await  fetch('http://localhost:3001/api/files/upload', {
        method: 'POST',
        body: formData,
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text();
    })
    .then(data => {
        console.log('Success:', data);
        // alert('File uploaded successfully.');
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('Error uploading file');
    });
}

    const handleRowClick = (item) => {
        alert(`Clicked on ${item.type}: ${item.name}`);
        localStorage.setItem('selectedItemId', item.id);
        const pathname = location.pathname;
        navigate(`${pathname}/${item.name}`);
    };

    
    const getFileIcon = (type, name) => {
      if (type === 'folder') {
          return <FaFolder className="text-yellow-500 text-[24px] " />;
      } else {
          const fileExtension = name.split('.').pop().toLowerCase();
          switch (fileExtension) {
              case 'csv':
                  return <img style={{width:'23px'}} src={CSVIcon} alt="CSV" />;
              case 'doc':
              case 'docx':
                  return <img style={{width:'23px'}}  src={DocIcon} alt="Document" />;
              case 'pdf':
                  return <img style={{width:'23px'}}  src={PDFIcon} alt="PDF" />;
              case 'xls':
              case 'xlsx':
                  return <img style={{width:'23px'}}  src={XLSIcon} alt="Excel" />;
              default:
                  return <IoIosDocument className="text-slate-500" />;
          }
      }
  };
  const getTimeAgo = (dateTime) => {
    const now = new Date();
    const past = new Date(dateTime);
    const diffInSeconds = Math.floor((now - past) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
  
    if (diffInSeconds < 60) {
      return `${diffInSeconds} sec ago`;
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour ago`;
    } else {
      return past.toLocaleDateString();
    }
  };

  const handleEditClick = (e, item) => {
    e.stopPropagation(); // Prevent row onClick event
    setCurrentItem({
      type: item.type,
      id: item.type === 'folder' ? item.FolderID : item.FileID,
      name: item.FolderName || item.FileName
    });
    setIsModalOpen(true);
};
const closeModal = () => {
  setIsModalOpen(false);
  // Reset the current item if needed
  setCurrentItem({ type: '', id: '', name: '' });
};

const handleSubmit = async (e) => {
  e.preventDefault(); // Prevent default form submission
  const editAPI = currentItem.type === 'folder' ? 'http://localhost:3001/api/folders/update/' : 'http://localhost:3001/api/files/update/';
  
  try {
      const response = await fetch(`${editAPI}${currentItem.id}`, {
          method: 'PUT', // or 'PATCH'
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ newName: currentItem.name }),
      });
      if (!response.ok) {
          throw new Error('Failed to edit item.');
      }
      alert('Item edited successfully.');
  const currentFolderId =      getCurrentFolderIdFromBreadcrumbs()
    console.log(currentFolderId)    
  fetchDirectoryContents(currentFolderId); // Refresh the directory contents
      closeModal(); // Close the modal after successful edit
  } catch (error) {
      console.error('Error editing item:', error);
      alert('Error editing item.');
  }
};


     
  return (
    <>
 

    <div className="w-full h-full flex flex-col justify-center items-center"
    onDragOver={(e) => handleDragOver(e)}
    onDrop={(e) => handleDrop(e)}
    >
        {/* <p className=" font-montserrat text-[24px] font-[600]">Simple Daisy Table Component</p> */}
        <div className="w-full h-full">
{/* drag and drop  */}
        <div className="max-h-full overflow-y-auto overflow-x-auto "
  
  >
    <table className="table bg-red text-gray-700  ">
      <thead className="sticky z-10 top-0 bg-slate-50 text-gray-500">
        <tr>
          <th> {/* Extra header for checkbox column */} </th>
          {data.columnsV1.map((column, index) => (
            <th key={index}>
              {column.header === 'Type'? 
                  <CiFolderOn className='text-[20px]'/>
              :
                  column.header
              }
            </th>
          ))}
        </tr>
      </thead>
      <tbody className='cursor-auto	'>
      {directoryContents.items.map((row, rowIndex) => (
         <tr  key={rowIndex}
         draggable
         onDragStart={(e) => handleDragStart(e, row)}
         onDragOver={(e) => handleDragOver(e, rowIndex)}
         onDragLeave={(e) => handleDragLeave(e, rowIndex)}
          
              onDrop={(e) =>   handleDrop(e, row)}
              onClick={() => row.type === 'folder' && debouncedHandleFolderClick (row)}
             
              className={`${row.type === 'folder' ? 'cursor-pointer ' : ''}${row.type === 'folder' && draggedOverRow === rowIndex ? 'border-2 border-blue-400 border-dashed' : ''}`}
              >
              <td onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            checked={checkedRows.includes(rowIndex)}
                                            onChange={(e) => handleCheckboxChange(e, rowIndex)}
                                        />
                                    </td>
            <td>{getFileIcon(row.type, row.FileName || row.FolderName)}</td>
            <td>{row.FileName || row.FolderName}</td>
            <td>{ getTimeAgo(row.Created) }</td>
            <td>{getTimeAgo( row.LastRevised)}</td>
            <td>{row.OwnerUserID || row.OwnerUserID}</td>
             
            <td>{row.DepartmentId || row.DepartmentId}</td>
           <td>
           <div className='flex gap-2'>
                      <button 
                          className="btn btn-square btn-outline min-h-0 h-min w-min p-2"
                          onClick={(e) => handleEditClick(e, row)}
                      >
                          Edit
                      </button>
                      </div>
           </td>
            
          </tr>
        ))}
           
      </tbody>
    </table>
    {isModalOpen && (
    <dialog open className="modal">
        <div className="modal-box bg-white">
            <button type="button" className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={closeModal}>✕</button>
            
            <div className='w-auto h-auto mb-4'>
                <p className='font-[600] text-[22px] '>Edit {currentItem.type}</p>
            </div>
            
            <form onSubmit={handleSubmit}>
                <div className='w-auto h-auto flex flex-col gap-4'>
                    <label className='flex gap-2 items-center'>
                        Name:
                        <input 
                            type="text" 
                            value={currentItem.name} 
                            placeholder="Type here" 
                            className="input input-bordered w-full max-w-xs bg-white"
                            onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })} required 
                        />
                    </label>
                    
                    <div className='w-full h-auto flex justify-center gap-4'>
                        <button type="button" className="btn bg-red-300 hover:bg-red-400 border-none text-gray-700" onClick={closeModal}>Cancel</button>
                        <button type="submit" className="btn bg-green-300 hover:bg-green-400 border-none text-gray-700">Save</button>
                    </div>
                </div>
            </form>
        </div>
    </dialog>
)}



  </div>
  {checkedRows.length > 0 && (
      <div className="text-right mt-4 absolute bottom-2">
        <button
          className="btn btn-error"
          onClick={handleDelete}
        >
          Delete Selected
        </button>
      </div>
    )}
            {/* <Table2 navigate={navigate} location={location}/> */}
        </div>
    </div>
    </>
  )
}
