import React, { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

// Extend the context to include directory contents management
const BreadcrumbContext = createContext();
 
// Hook to use context
export const useBreadcrumb = () => useContext(BreadcrumbContext);

export const BreadcrumbProvider = ({ children }) => {
  // Existing breadcrumbs state
  const [breadcrumbs, setBreadcrumbs] = useState(() => {
    const savedBreadcrumbs = localStorage.getItem('breadcrumbs');
    return savedBreadcrumbs ? JSON.parse(savedBreadcrumbs) : [{ name: "Home", folderId: null }];
  });
  
  // New state for directory contents
const navigate =  useNavigate();
const addBreadcrumb = (name, folderId) => {
  // Convert the folder name into a URL-friendly format
  const folderPathSegment = encodeURIComponent(name.replace(/\s+/g, '-').toLowerCase());
  
  // Construct the full path based on existing breadcrumbs and the new segment
  const newPath = breadcrumbs.reduce((acc, crumb) => {
    // Convert each breadcrumb name into a URL-friendly format and append it to the accumulator
    return `${acc}/${encodeURIComponent(crumb.name.replace(/\s+/g, '-').toLowerCase())}`;
  }, '');

  const folderPath = `${newPath}/${folderPathSegment}`;

  // Navigate to the newly constructed path
  navigate(folderPath);

  // Update the breadcrumb state with the new folder
  setBreadcrumbs(prev => {
    const updatedBreadcrumbs = [...prev, { name, folderId }];
    localStorage.setItem('breadcrumbs', JSON.stringify(updatedBreadcrumbs));
    return updatedBreadcrumbs;
  });
};


  
const resetBreadcrumbs = () => {
  const resetState = [{ name: "Home", folderId: null }];
  setBreadcrumbs(resetState);
  localStorage.setItem('breadcrumbs', JSON.stringify(resetState));
};

 
 
const navigateToBreadcrumb = (folderName, folderId) => {
  // First, find the index of the clicked breadcrumb
  const clickedBreadcrumbIndex = breadcrumbs.findIndex(breadcrumb => breadcrumb.folderId === folderId);

  if (clickedBreadcrumbIndex >= 0) {
    // Construct the path from the root to the clicked breadcrumb
    // This involves encoding the folder names to ensure URL-friendliness
    const pathToClickedBreadcrumb = breadcrumbs.slice(0, clickedBreadcrumbIndex + 1)
      .map(crumb => encodeURIComponent(crumb.name.replace(/\s+/g, '-').toLowerCase()))
      .join('/');

    // Build the full path for navigation
    const fullPath = `/${pathToClickedBreadcrumb}`;
    console.log("Navigating to path:", fullPath);

    // Navigate to the constructed path
    navigate(fullPath);
    
    // Update breadcrumbs state to only include breadcrumbs up to and including the clicked one
    // Also update the local storage to reflect this change
    setBreadcrumbs(currentBreadcrumbs => {
      const updatedBreadcrumbs = currentBreadcrumbs.slice(0, clickedBreadcrumbIndex + 1);
      localStorage.setItem('breadcrumbs', JSON.stringify(updatedBreadcrumbs));
      return updatedBreadcrumbs;
    });
  

    // Fetch the content based on folderId
    // This could involve making an API call or querying a local data structure
    fetchDirectoryContents(folderId);
  }
};

  
  const [directoryContents, setDirectoryContents] = useState({
    parentFolderId: null,
    items: [],
  });
  // Function to fetch directory contents
  const fetchDirectoryContents = async (folderId = null) => {
    try {
      const url = new URL("http://localhost:3001/api/folders/contents");
      if (folderId) {
        console.log(folderId);
        url.searchParams.append("parentFolderId", folderId);

        console.log(url);
      }
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setDirectoryContents(data); // Update state with fetched data
        console.log(data);
      } else {
        throw new Error("Failed to load directory contents");
      }
    } catch (error) {
      console.error("Error fetching directory contents:", error);
    }
  };
  const navigateToParent = async () => {
    if (breadcrumbs.length > 1) {
      // Construct the path to navigate to, based on the breadcrumbs up to the parent
      const newBreadcrumbs = breadcrumbs.slice(0, breadcrumbs.length - 1);
      const parentFolderPath = newBreadcrumbs.reduce((path, crumb) => {
        return `${path}/${encodeURIComponent(crumb.name.replace(/\s+/g, '-').toLowerCase())}`;
      }, '');
  
      // Update breadcrumbs state and localStorage
      setBreadcrumbs(newBreadcrumbs);
      localStorage.setItem('breadcrumbs', JSON.stringify(newBreadcrumbs));
  
      // Navigate to the constructed parent folder path
      navigate(parentFolderPath || '/');
  
      // Fetch the content based on the parent folderId
      const parentFolderId = newBreadcrumbs[newBreadcrumbs.length - 1].folderId;
      await fetchDirectoryContents(parentFolderId);
    } else {
      // Optionally handle the case when there's no parent (e.g., already at the root)
      console.log("Already at the root directory.");
      // Ensure you're at the root path
      navigate('/');
      // Optionally reset to root directory contents if needed
      fetchDirectoryContents();
    }
  };
  

  // Including the fetchDirectoryContents function and directoryContents in the context value
  return (
    <BreadcrumbContext.Provider
      value={{
        directoryContents,
        fetchDirectoryContents,
        breadcrumbs,
        addBreadcrumb,
        resetBreadcrumbs,
        navigateToBreadcrumb,
        navigateToParent,
      }}
    >
      {children}
    </BreadcrumbContext.Provider>
  );
};
