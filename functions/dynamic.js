// forest.js
const GlobalModel = require("../model/Global");
const systemDate = new Date().toISOString().slice(0, 19).replace("T", " ");

// Function to add a forest
async function addItem(tableName, payload) {
  // Logic to add new record to the database
  let results = await GlobalModel.Create(payload, tableName, "");
  return results;
}

// Function to get list of items from db
async function getItems(tableName, columnsToSelect, conditions) {
  let results = await GlobalModel.Finder(
    tableName,
    columnsToSelect,
    conditions
  );
  return results;
}

async function getItemById(tableName, columnsToSelect, conditions) {
  let results = await GlobalModel.Finder(
    tableName,
    columnsToSelect,
    conditions
  );
  return results;
}

async function updateItem(payload,tableName,recordId,recordValue) {
  payload.updated_at = systemDate;

  const runupdate = await GlobalModel.Update(
    payload,
    tableName,
    recordId,
   recordValue,
  );

  return runupdate;
}



module.exports = {
  addItem,
  getItems,
  getItemById,
  updateItem
};
