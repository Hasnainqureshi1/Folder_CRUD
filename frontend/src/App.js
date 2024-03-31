import React from "react";
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
 
import Table from "./pages/Table";
import NotFound from "./pages/NotFound";
import LayoutWithNav from './Components/LayoutWithNav';
import { BreadcrumbProvider } from "./Context/BreadcrumbContext";

function App() {
  return (
    <Router>
       <BreadcrumbProvider>
       <Routes>
          <Route path="/" element={<Navigate to="/Home" replace />} />
          <Route path="/" element={<LayoutWithNav />}>
            {/* Using a wildcard route to capture nested paths */}
            <Route path="Home/*" element={<Table />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      
        </BreadcrumbProvider> 
    </Router>
  );
}

export default App;
