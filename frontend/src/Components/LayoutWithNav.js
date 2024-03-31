import React from 'react'
import Navbar from './Navbar'
import { Outlet } from "react-router-dom";
export default function LayoutWithNav() {
  return (
    <div className='w-screen h-screen   border-white bg-slate-50   flex justify-center  m'>
        <div className=' w-10/12  mt-10  text-gray-700  '>
            <div className='h-auto bg-slate-200'>
                <Navbar/>
            </div>
            <div className='h-[360px] border-2 border-slate-100 bg-white text-gray-700 '>
                <Outlet />
            </div>
        </div>
    </div>
  )
}
// FilesTable Component

// import React, { useState, useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';

// // Assuming you have a Navbar component that accepts breadcrumbs as props
// import Navbar from './Navbar';

// const FilesTable = () => {
//     const { folderId } = useParams(); // Using React Router's useParams hook to get the current folder ID from the URL
//     const navigate = useNavigate();
//     const [folders, setFolders] = useState([]);
//     const [files, setFiles] = useState([]);
//     const [breadcrumbs, setBreadcrumbs] = useState([{ name: 'Home', path: '/' }]);

//     useEffect(() => {
//         // Fetch folders and files based on folderId
//         fetchFolderContents(folderId);
//         // Update breadcrumbs
//         updateBreadcrumbs(folderId);
//     }, [folderId]);

//     const fetchFolderContents = async (folderId) => {
//         // Placeholder: Replace with your API call to fetch folders and files
//         console.log(`Fetching contents for folder: ${folderId}`);
//         // On success, update state:
//         // setFolders(responseData.folders);
//         // setFiles(responseData.files);
//     };

//     const updateBreadcrumbs = async (folderId) => {
//         // Placeholder: Implement logic to fetch folder names up to root for breadcrumbs
//         // For simplicity, we're generating dynamic breadcrumbs based on folderId
//         if (folderId) {
//             // Example to append the current folder to breadcrumbs
//             // In practice, you'd fetch the folder's name and its parent hierarchy
//             setBreadcrumbs(prev => [...prev, { name: `Folder ${folderId}`, path: `/folder/${folderId}` }]);
//         } else {
//             // Reset to default if no folderId (we're at the root)
//             setBreadcrumbs([{ name: 'Home', path: '/' }]);
//         }
//     };

//     return (
//         <>
//             <Navbar breadcrumbs={breadcrumbs} />
//             <div className="table-container">
//                 <table>
//                     {/* Table headers */}
//                     <tbody>
//                         {folders.map(folder => (
//                             <tr key={folder.id} onClick={() => navigate(`/folder/${folder.id}`)}>
//                                 <td>{folder.name}</td>
//                             </tr>
//                         ))}
//                         {files.map(file => (
//                             <tr key={file.id}>
//                                 <td>{file.name}</td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//         </>
//     );
// };

// export default FilesTable;
