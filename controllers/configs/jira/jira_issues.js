const bcyrpt = require("bcrypt");
const asynHandler = require("../../../middleware/async");
const {
  sendResponse,
  CatchHistory,
  sendCookie,
} = require("../../../helper/utilfunc");
const {
  getItems,
  getItemById,
  updateItem,
  addItem,
  makeApiCall,
  sendtoRabbitMQ,
  getActiveJiraInstance,
} = require("../../../functions/dynamic");

exports.SetupJiraIssue = asynHandler(async (req, res, next) => {
  let channelData = req.channelInfo;

  const { summary, description, issuetype } = req.body;

  // Validate the incoming data
  if (!summary || !description || !issuetype) {
    return sendResponse(
      res,
      0,
      400,
      "Summary, description, and issuetype are required.",
      []
    );
  }

  const payload = {
    channel_id: channelData.channel_id,
    // jira_instance_id: mainJiraInstance.id,
    request_type: "issue_create",
    request_data: {
      fields: {
        project: {
          key: "GCS",
        },
        summary: summary,
        description: description,
        issuetype: {
          name: issuetype,
        },
      },
    },
    status: "pending",
  };

  sendtoRabbitMQ(payload);

  return sendResponse(res, 1, 200, "Your request is being processed", []);
});

exports.ListAllJiraIssues = asynHandler(async (req, res, next) => {
  const tableName = "requests";
  const columnsToSelect = [];
  const conditions = [];
  let results = await getItems(tableName, columnsToSelect, conditions);
  if (results.rows.length == 0) {
    return sendResponse(res, 0, 200, "Sorry, No Record Found", []);
  }

  sendResponse(res, 1, 200, "Record Found", results.rows);
});

exports.ListJiraIssue = asynHandler(async (req, res, next) => {
  const tableName = "requests";
  const columnsToSelect = [];
  const conditions = [
    {
      column: "channel_id",
      operator: "=",
      value: req.body.channel_id,
    },
  ];

  let results = await getItemById(tableName, columnsToSelect, conditions);

  const GhIPSSAppUrl = process.env.GhIPSS_APP_URL;
  const JiraUsername = process.env.JIRA_AUTH_USERNAME;
  const JiraPassword = process.env.JIRA_AUTH_PASSWORD;

  async function fetchJiraIssues(results) {
    if (results.rows.length === 0) {
      return sendResponse(res, 0, 200, "Sorry, No Record Found", []);
    }

    try {
      // Loop through each result and fetch Jira issue data
      const issueDataPromises = results.rows.map(async (row) => {
        const issueKey = row.response_data?.key; // Access the key from response_data

        if (!issueKey) {
          console.warn(`No issue key found for row with id: ${row.id}`);
          return { ...row, issueData: null };
        }
        const response = await makeApiCall(
          `${GhIPSSAppUrl}issue/${issueIdOrKey}`,
          "GET",
          null,
          { Accept: "application/json", "Content-Type": "application/json" },
          "Basic",
          {
            username: JiraUsername,
            password: JiraPassword,
          }
        );

        // Return the issue data along with the original row data if necessary
        return { ...row, issueData: response };
      });

      // Await all promises to get the data for each issue
      const issueData = await Promise.all(issueDataPromises);

      // Send response with the collected issue data
      sendResponse(res, 1, 200, "Record Found", issueData);
    } catch (error) {
      console.error("Error fetching Jira issues:", error);
      sendResponse(res, 0, 500, "Error Fetching Jira Issues", []);
    }
  }

  // Usage: Call the function and pass in the results object
  fetchJiraIssues(results);
});

exports.GetJiraInstanceById = asynHandler(async (req, res, next) => {
  const tableName = "jira_instances";
  const columnsToSelect = [
    "id",
    "name",
    "username",
    "url",
    "created_at",
    "updated_at",
  ];
  const conditions = [
    {
      column: "id",
      operator: "=",
      value: req.body.id,
    },
  ];

  let results = await getItemById(tableName, columnsToSelect, conditions);
  if (results.rows.length == 0) {
    return sendResponse(res, 0, 200, "Sorry, No Record Found", []);
  }
  sendResponse(res, 1, 299, "Record Found", results.rows);
});

exports.UpdateJiraIssue = asynHandler(async (req, res, next) => {
  const tableName = "requests";
  const columnsToSelect = [];
  const conditions = [
    {
      column: "id",
      operator: "=",
      value: req.body.request_id,
    },
  ];

  let results = await getItemById(tableName, columnsToSelect, conditions);

  if (results.rows.length === 0) {
    return sendResponse(res, 0, 200, "Sorry, No Record Found", []);
  }

  try {
    const issueKey = results.rows[0].response_data?.key; // Access the key from response_data

    if (!issueKey) {
      console.warn(`No issue key found for row with id: ${row.id}`);
      return sendResponse(res, 0, 200, "Sorry, No Issue Key Found", []);
    }
    const { summary, description, issuetype } = req.body;

    let jiraInstance = await getActiveJiraInstance();
    let mainJiraInstance = jiraInstance.rows[0];

    const GhIPSSAppUrl = process.env.GhIPSS_APP_URL;
    const JiraUsername = mainJiraInstance.username;
    const JiraPassword = mainJiraInstance.password;

    const response = await makeApiCall(
      `${GhIPSSAppUrl}issue/${issueKey}`,
      "PUT",
      {
        fields: {
          summary: summary,
          description: description ?? "",
          issuetype: {
            name: issuetype ?? "",
          },
        },
      },
      { Accept: "application/json", "Content-Type": "application/json" },
      "Basic",
      {
        username: JiraUsername,
        password: JiraPassword,
      }
    );

    console.log("updated res:", response);
    return sendResponse(res, 1, 200, "Record Updated", response);
  } catch (error) {
    console.error("Update failed, please try later", error);
    return sendResponse(res, 0, 200, "Update failed, please try later", []);
  }
});

exports.UserJiraInstances = asynHandler(async (req, res, next) => {
  const tableName = "jira_instances";
  const columnsToSelect = [];
  const conditions = [
    { column: "user_id", operator: "=", value: req.user.user_id },
  ];

  let results = await getItemById(tableName, columnsToSelect, conditions);
  if (results.rows.length == 0) {
    return sendResponse(res, 0, 200, "Sorry, No Record Found", []);
  }
  sendResponse(res, 1, 299, "Record Found", results.rows);
});
