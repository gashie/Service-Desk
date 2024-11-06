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
  ListJiraIssue,
  UpdateJiraIssue,
  CreateJiraIssue,
  GetJiraIssue,
} = require("../controllers/configs/jira/jira_issues");
const router = express.Router();

router.route("/system/create_channel").post(SetupChannel);
router.route("/system/list_channels").post(ListAllChannels);
router.route("/system/get_channel").post(protect, GetChannelById);

router.route("/system/create_jira_instance").post(protect, SetupJiraInstance);
router.route("/system/list_jira_instances").post(protect, ListAllJiraInstances);
router.route("/system/update_jira_instance").post(protect, UpdateJiraInstance);
router.route("/system/get_jira_instance").post(protect, GetJiraInstanceById);

router.route("/create_jira_issue").post(protect, CreateJiraIssue);
router.route("/get_jira_issue").post(protect, GetJiraIssue);
router.route("/list_jira_issue").post(protect, ListJiraIssue);
router.route("/list_jira_issues").post(protect, ListAllJiraIssues);
router.route("/update_jira_issue").post(protect, UpdateJiraIssue);

//jira issues with rabbit mq

router.route("/system/test").post(protect, TestChannel);

module.exports = router;
