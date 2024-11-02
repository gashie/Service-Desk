const amqp = require("amqplib");
const EventEmitter = require("events");
const {
  getActiveJiraInstance,
  makeApiCall,
  addItem,
} = require("./functions/dynamic");
const { sendResponse } = require("./helper/utilfunc");

const eventEmitter = new EventEmitter();

const QUEUE_NAME = "jira_requests";
const RABBITMQ_URL = "amqp://localhost"; // Replace with your RabbitMQ URL
const INTERVAL_MS = 1000; // Interval to manage CPU load

async function processQueue() {
  console.log("running....,");
  
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(QUEUE_NAME);

    // Process messages from the queue with intervals
    const intervalId = setInterval(async () => {
      const msg = await channel.get(QUEUE_NAME, { noAck: false });

      if (msg) {
        const requestId = msg.content.toString();
        console.log(`Processing Request ID: ${JSON.parse(requestId)}`);

        // Placeholder actions for pushing to API and saving to DB
        await pushToAPI(JSON.parse(requestId));
        // await saveToDB(requestId);

        console.log(`Completed Request ID: ${requestId}`);
        channel.ack(msg);
      } else {
        // Clear interval if no messages are left to process
        console.log("No messages in queue, pausing...");
        clearInterval(intervalId);
      }
    }, INTERVAL_MS);
  } catch (error) {
    console.error("Error processing message from RabbitMQ:", error);
  }
}

// Placeholder function for pushing data to an API
async function pushToAPI(requestId) {
  // Implement API call here
  let jiraInstance = await getActiveJiraInstance();
  let mainJiraInstance = jiraInstance.rows[0];

  const GhIPSSAppUrl = process.env.GhIPSS_APP_URL;
  const JiraUsername = mainJiraInstance.username;
  const JiraPassword = mainJiraInstance.password;
  let response = await makeApiCall(
    `${GhIPSSAppUrl}/issue`,
    "POST",
    requestId.request_data,
    { Accept: "application/json", "Content-Type": "application/json" },
    "Basic",
    {
      username: `${JiraUsername}`,
      password: `${JiraPassword}`,
    }
  );
  requestId.response_data = response;
  requestId.jira_instance_id = mainJiraInstance.id;

  console.log("Response check:", response);

  console.log("Payload:", requestId);
  saveToDB(requestId)
}

// Placeholder function for saving data to the database
async function saveToDB(requestId) {
  // Implement DB save logic here
  let tableName = "requests";

  let result = await addItem(tableName, requestId);
  if (result.rowCount == 1) {
    console.log({success:1,code:200,message: "Re cord Saved"});
  } else {
    console.log({success:1,code:200,message: "Sorry, error saving record: contact administrator"})

  }
}

// Export functions
module.exports = {
  processQueue,
};
