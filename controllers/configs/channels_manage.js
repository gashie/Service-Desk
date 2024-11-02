const asynHandler = require("../../middleware/async");
const { sendResponse, CatchHistory } = require("../../helper/utilfunc");
const {
  getItems,
  getItemById,
  updateItem,
} = require("../../functions/dynamic");
const { autoProcessAuthKey } = require("../../helper/autoCreate");
const cron = require("node-cron");

exports.SetupChannel = asynHandler(async (req, res, next) => {
  let { app_id, api_key, name, results } = await autoProcessAuthKey(req);
  if (results.rowCount == 1) {
    return sendResponse(res, 1, 200, "New channel added", {
      channel: name,
      app_id,
      api_key,
    });
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

exports.ListAllChannels = asynHandler(async (req, res, next) => {
  const tableName = "channels";
  const columnsToSelect = [];
  const conditions = [];
  let results = await getItems(tableName, columnsToSelect, conditions);
  if (results.rows.length == 0) {
    return sendResponse(res, 0, 200, "Sorry, No Record Found", []);
  }

  sendResponse(res, 1, 200, "Record Found", results.rows);
});

exports.GetChannelById = asynHandler(async (req, res, next) => {
  // Logic to get user details from the database
  const tableName = "channels";
  const columnsToSelect = []; // Use string values for column names
  const conditions = [{ column: "id", operator: "=", value: req.body.id }];
  let results = await getItemById(tableName, columnsToSelect, conditions);
  if (results.rows.length == 0) {
    return sendResponse(res, 0, 200, "Sorry, No Record Found", []);
  }
  sendResponse(res, 1, 200, "Record Found", results.rows);
});

exports.UpdateChannel = asynHandler(async (req, res, next) => {
  let payload = req.body;
  const runupdate = await updateItem(payload, "apis", "id", payload.id);
  if (runupdate.rowCount == 1) {
    return sendResponse(res, 1, 200, "Record Updated", []);
  } else {
    return sendResponse(res, 0, 200, "Update failed, please try later", []);
  }
});

// req.customLog.event = "TESTING CHANNEL";
// req.customLog.actor = req.channelInfo.actor;
// res.send(req.channelInfo);
exports.TestChannel = asynHandler(async (req, res, next) => {
  function logMessage() {
    console.log("Cron job executed at:", new Date().toLocaleString());
  }

  cron.schedule("*/10 * * * * *", () => {
    logMessage("Hello world");
  });
});
