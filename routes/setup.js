const express = require("express");
const {
  SetupChannel,
  TestChannel,
  ListAllChannels,
  GetChannelById,
} = require("../controllers/configs/channels_manage");
const { protect } = require("../middleware/auth");
const {
  SetupJiraInstance,
  ListAllJiraInstances,
  UpdateJiraInstance,
  GetJiraInstanceById,
} = require("../controllers/configs/jira/create_jira_instance");
const {
  SetupJiraIssue,
  ListAllJiraIssues,
} = require("../controllers/configs/jira/jira_issues");
const router = express.Router();

router.route("/system/create_channel").post(SetupChannel);
router.route("/system/list_channels").post(ListAllChannels);
router.route("/system/get_channel").post(protect, GetChannelById);

router.route("/system/create_jira_instance").post(protect, SetupJiraInstance);
router.route("/system/list_jira_instances").post(protect, ListAllJiraInstances);
router.route("/system/update_jira_instance").post(protect, UpdateJiraInstance);
router.route("/system/get_jira_instance").post(protect, GetJiraInstanceById);

router.route("/system/create_jira_issue").post(protect, SetupJiraIssue);
router.route("/system/list_jira_issues").post(protect, ListAllJiraIssues);

router.route("/system/test").post(protect, TestChannel);

module.exports = router;
