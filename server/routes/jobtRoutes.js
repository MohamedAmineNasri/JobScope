const express = require("express");
const { createJob, singleJob, updateJob, showJobs } = require("../controller/jobsController");
const { isAuthenticated } = require("../middleware/auth");
const router = express.Router();


//job routes

// /api/create
router.post("/create/job", isAuthenticated, createJob);

// /api/job/:id
router.get("/job/:id", singleJob);

// /api/job/update/:job_id
router.put("/job/update/:job_id", isAuthenticated, updateJob);

// /api/jobs/show
router.get("/jobs/show", showJobs);



module.exports = router;



