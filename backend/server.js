const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./authRoutes');
const cors = require('cors');

const app = express();

app.use(cors());
const port = 4000;

app.use(bodyParser.json());

// Define a simple route for the root path
app.get('/', (req, res) => {
    res.send('Welcome to the server!');
  });
  
  // Use the authentication routes under the '/auth' path
  app.use('/auth', authRoutes);
  

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
