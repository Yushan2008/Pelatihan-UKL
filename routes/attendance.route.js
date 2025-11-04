const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  markAttendance,
  getHistory,
  getSummary,
  analyzeAttendance
} = require("../controllers/attendance.controller");

router.post("/", auth, markAttendance);
router.get("/history/:user_id", auth, getHistory);
router.get("/summary/:user_id", auth, getSummary);
router.post("/analysis", auth, analyzeAttendance);

module.exports = router;
