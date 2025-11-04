const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { createUser, updateUser, getUser } = require("../controllers/user.controller");

router.post("/", auth, createUser);
router.put("/:id", auth, updateUser);
router.get("/:id", auth, getUser);

module.exports = router;
