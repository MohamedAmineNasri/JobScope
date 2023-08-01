const express = require("express");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const { createJobType, allJobType } = require("../controller/jobTypeController");
const router = express.Router();


//job type routes

// /api/type/create
router.post("/type/create", isAuthenticated, isAdmin, createJobType);

// /api/type/jobs
router.get("/type/jobs", isAuthenticated, allJobType);


module.exports = router;



