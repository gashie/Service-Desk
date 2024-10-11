const express = require("express");
const { SetupAPI, ListAllAPIS, UpdateAPI } = require("../controllers/configs/api_manage");
const { SetupChannel, TestChannel } = require("../controllers/configs/channels_manage");
const { protect } = require("../middleware/auth");
const router = express.Router();


//channels

router.route("/system/create_channel").post(SetupChannel);

router.route("/system/create_api").post(SetupAPI);
router.route("/system/view_apis").post(ListAllAPIS);
router.route("/system/find_api").post(ListAllAPIS);
router.route("/system/update_api").post(UpdateAPI);

router.route("/system/test").post(protect,TestChannel);

module.exports = router;