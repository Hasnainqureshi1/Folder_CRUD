const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

// Database setup
 

 
const app = express();
app.use(cors());
app.use(express.json());
const dbPool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  // password: 'your_password', // Uncomment and replace 'your_password' with your actual password
  database: 'filemanager',
}).promise();


// Make dbPool accessible in the request object
express.request.db = dbPool;

 
// Routes
const folderRoutes = require('./routes/folderRoutes');
const fileRoutes = require('./routes/fileRoutes');

app.use('/api/folders', folderRoutes);
app.use('/api/files', fileRoutes);

// Port setup
const PORT = process.env.PORT || 3001;
const serverURL = `http://localhost:${PORT}`; // Replace 'localhost' with your actual hostname if applicable

app.listen(PORT, () => {
  console.log(`Server is running at ${serverURL}`);
});
app.get('/', (req, res) => {
  const serverUrl = `${req.protocol}://${req.get('host')}`;
  res.send(`Server URL: ${serverUrl}`);
});