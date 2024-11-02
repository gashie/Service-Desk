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
  const GhIPSSAppUrl = process.env.GhIPSS_APP_URL;
  const JiraUsername = process.env.JIRA_AUTH_USERNAME;
  const JiraPassword = process.env.JIRA_AUTH_PASSWORD;

  let results = makeApiCall(
    `${GhIPSSAppUrl}issue/{issueIdOrKey}`,
    "GET",
    null,
    { Accept: "application/json", "Content-Type": "application/json" },
    "Basic",
    {
      username: `${JiraUsername}`,
      password: `${JiraPassword}`,
    }
  );

  console.log(JSON.stringify(results));
  //   if (results.rows.length == 0) {
  //     return sendResponse(res, 0, 200, "Sorry, No Record Found", []);
  //   }

  sendResponse(res, 1, 200, "Record Found", results.rows);
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

exports.UpdateJiraInstance = asynHandler(async (req, res, next) => {
  let payload = req.body;
  const runupdate = await updateItem(
    payload,
    "jira_instances",
    "id",
    payload.id
  );
  if (runupdate.rowCount == 1) {
    return sendResponse(res, 1, 200, "Record Updated", []);
  } else {
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
