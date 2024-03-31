 
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiArrowUp } from 'react-icons/fi'; // For the upward back arrow
import { FaFolderOpen } from "react-icons/fa";
import { useBreadcrumb } from '../Context/BreadcrumbContext';

 

export default function Navbar() {
  const showModal = () => setIsModalOpen(true);
const closeModal = () => setIsModalOpen(false);
const [isModalOpen, setIsModalOpen] = useState(false);


  const navigate = useNavigate();
  const location = useLocation();
  const {  setBreadcrumbs,fetchDirectoryContents } = useBreadcrumb();
 
  const { breadcrumbs, navigateToBreadcrumb,navigateToParent  } = useBreadcrumb();
  const [folderName, setFolderName] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentFolderId = breadcrumbs[breadcrumbs.length - 1]?.folderId;
    // console.log(parentFolderId)
    await handleFolderSubmit(folderName, currentFolderId);
    // Assuming closeModal is the function to close the modal
    closeModal(); 
    // Assuming currentFolderId is the ID of the folder you're currently in, to refresh contents
  
      console.log(currentFolderId)
    fetchDirectoryContents(currentFolderId);
  };
  

  const handleFolderSubmit = async (folderName, parentFolderId) => {
    const requestBody = {
      FolderName: folderName,
      OwnerUserID: "dummyUserID", // Replace with actual user ID as needed
      DepartmentId: "dummyDepartmentId", // Replace with actual department ID as needed
      ParentFolderID:parentFolderId
    };
  
    // Conditionally add ParentFolderID if not null
    if (parentFolderId) {
      requestBody.ParentFolderID = parentFolderId;
    }
    console.log(parentFolderId)
  
    try {
      const response = await fetch("http://localhost:3001/api/folders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });
  
      if (!response.ok) {
     
        alert(`Failed to create new folder`);
      }
  
      // Optionally process the response data
      const data = await response.json();
      setFolderName('')
      // console.log("Folder created:", data);
      // alert(`Folder "${folderName}" created successfully`);
  
      // Here, you might want to update the application state, such as adding the new folder to the list
      // Since we're fetching directory contents after this, it might already be covered
    } catch (error) {
      console.error("Error creating folder:", error);
      alert("Error creating folder");
    }
  };
  

  return (
    <div className='w-full h-full border-2   flex'>
        <div className="text-md breadcrumbs basis-[80%] border-2  ">
            <ul>
            {breadcrumbs.map((breadcrumb, index) => (
  <span key={index}>
    {index < breadcrumbs.length - 1 ? (
      <React.Fragment>
        <button 
          style={{ fontWeight: 'bold' }}
          onClick={() => navigateToBreadcrumb(breadcrumb.name, breadcrumb.folderId)}
        >
          {breadcrumb.name}
        </button>
        <span style={{ marginRight: 5 }}>></span>
      </React.Fragment>
    ) : (
      <span style={{ fontWeight: 'bold' }}>{breadcrumb.name}</span>
    )}
  </span>
))}
                
            </ul>
        </div>
        <div className='basis-[20%]  flex justify-center gap-2'>
            <button onClick={navigateToParent} className="btn min-h-0 h-[40px] bg-slate-50 flex justify-center items-center">
                <FiArrowUp className='text-[20px]'/>
            </button>
            <button className="btn min-h-0 h-[40px] bg-slate-50 flex justify-center items-center" onClick={showModal}>
                <FaFolderOpen className='text-[20px] text-yellow-400'/>
            </button>
        </div>
      {  isModalOpen && (
        <dialog open className="modal">
    <div className="modal-box bg-white">
        {/* Use type="button" to prevent form submission and onClick to handle the action */}
        <button type="button" className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={closeModal}>✕</button>
        
        <div className='w-auto h-auto mb-4'>
            <p className='font-[600] text-[22px] '>Create New Folder</p>
        </div>
        
        <form onSubmit={handleSubmit}>
            <div className='w-auto h-auto flex flex-col gap-4'>
                <label className='flex gap-2 items-center'>
                    Folder Name:
                    <input 
                        type="text" 
                        value={folderName} 
                        placeholder="Type here" 
                        className="input input-bordered w-full max-w-xs bg-white"
                        onChange={(e) => setFolderName(e.target.value)} required 
                    />
                </label>
                
                <div className='w-full h-auto flex justify-center gap-4'>
                    {/* Fix Cancel button */}
                    <button type="button" className="btn bg-red-300 hover:bg-red-400 border-none text-gray-700" onClick={closeModal}>Cancel</button>
                    <button type="submit" className="btn bg-green-300 hover:bg-green-400 border-none text-gray-700">Create</button>
                </div>
            </div>
        </form>
    </div>
</dialog>
)
}
        
    </div>
  );
}
