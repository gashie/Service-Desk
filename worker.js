// worker.js
const { processQueue } = require("./process.js"); // Replace with your main file's name

// Start the queue processing
processQueue()
  .then(() => {
    console.log("Worker started, listening for new messages.");
  })
  .catch((error) => {
    console.error("Failed to start the worker:", error);
  });
