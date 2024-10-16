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
} = require("../../../functions/dynamic");

exports.SetupJiraInstance = asynHandler(async (req, res, next) => {
  console.log(req.body);
  let payload = req.body;
  const salt = await bcyrpt.genSalt(10);
  let password = await bcyrpt.hash(payload.password, salt);
  payload.password = password;

  let tableName = "jira_instances";
  let result = await addItem(tableName, payload);
  if (result.rowCount == 1) {
    return sendResponse(res, 1, 200, "Record Saved", []);
  } else {
    return sendResponse(
      res,
      0,
      200,
      "Sorry, error saving record: contact administrator",
      []
    );
  }
});

exports.ListAllJiraInstances = asynHandler(async (req, res, next) => {
  const tableName = "jira_instances";
  const columnsToSelect = [
    "id",
    "name",
    "username",
    "url",
    "status",
    "created_at",
    "updated_at",
  ];
  const conditions = [];
  let results = await getItems(tableName, columnsToSelect, conditions);
  if (results.rows.length == 0) {
    return sendResponse(res, 0, 200, "Sorry, No Record Found", []);
  }

  sendResponse(res, 1, 200, "Record Found", results.rows);
});

exports.GetJiraInstanceById = asynHandler(async (req, res, next) => {
  const tableName = "jira_instances";
  const columnsToSelect = [
    "id",
    "name",
    "username",
    "url",
    "status",
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

exports.ActivateJiraInstance = asynHandler(async (req, res, next) => {
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
