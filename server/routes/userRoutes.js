const express = require("express");
const router = express.Router();
const { allUsers, singleUser, editUser, deleteUser } = require("../controller/userController");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

//user routes

// /api/allusers
router.get("/allUsers",  isAuthenticated, isAdmin, allUsers);

// /api/user/id
router.get("/user/:id", isAuthenticated, singleUser);

// /api/user/edit/id
router.post("/user/edit/:id", isAuthenticated, editUser);

// /api/user/delete/id
router.post("/user/delete/:id", isAuthenticated, isAdmin, deleteUser);

module.exports = router;



