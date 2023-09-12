const express = require("express");
const router = express.Router();
const { allUsers, singleUser, editUser, deleteUser, createUserJobHistory, getUsersAppliedToJob, updateUserApplicationStatus } = require("../controller/userController");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

//user routes

// /api/allusers
router.get("/allUsers", allUsers);

// /api/user/id
router.get("/user/:id", isAuthenticated, singleUser);

// /api/user/edit/id
router.post("/user/edit/:id", isAuthenticated, editUser);

// /api/user/delete/id
router.delete("/user/delete/:id", isAuthenticated, isAdmin, deleteUser);

// /api/user/jobshistory   
router.post("/user/jobshistory", isAuthenticated, createUserJobHistory);



router.get("/users/applied/:job_id", getUsersAppliedToJob);


// Update a user's application status for a specific job
// router.put("/:userId/jobHistory/:jobId", updateUserApplicationStatus);
router.put("/user/:userId/jobHistory/:jobId", updateUserApplicationStatus);



module.exports = router;



