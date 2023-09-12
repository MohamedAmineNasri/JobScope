const express = require("express");
const { createJob, singleJob, updateJob, showJobs, deleteJob, toggleJobAvailability, updateAvailability, getUsersAppliedToJob, showJobsAll } = require("../controller/jobsController");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
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
router.get("/jobs/showAll", showJobsAll);

// /api/delete/:job_id
router.delete("/job/delete/:job_id", isAuthenticated, isAdmin, deleteJob);


router.put("/job/updateAvailability/:job_id", isAuthenticated, updateAvailability);






module.exports = router;



