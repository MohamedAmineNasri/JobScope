const express = require("express");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const { createJobType, allJobType, updateJobType, deleteJobType } = require("../controller/jobTypeController");
const router = express.Router();


//job type routes

// /api/type/create
router.post("/type/create", isAuthenticated, isAdmin, createJobType);

// /api/type/jobs
router.get("/type/jobs", isAuthenticated, allJobType);

// /api/type/update/type_id
router.put("/type/update/:type_id", isAuthenticated, isAdmin, updateJobType);

// /api/type/delete/type_id
router.delete("/type/delete/:type_id", isAuthenticated, isAdmin, deleteJobType);


module.exports = router;



