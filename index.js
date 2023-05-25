const express = require('express');
const uploadHandler = require('./uploadHandler');

// Create a new router
const router = express.Router();

// Use the router to handle the upload route
router.post('/upload', uploadHandler);

// Create the main function
const main = () => {
  // Create an Express app
  const app = express();

  // Use the router to handle the routes
  app.use(router);
  
  const port = 5000
  // Start the server
  app.listen(port, () => {
    console.log(`http://localhost:${port}`);
  });
};

// Run the main function
main();
