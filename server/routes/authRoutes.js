const express = require("express");
const router = express.Router();
const { signup, signin, logout, userProfile } = require("../controller/authController");
const { isAuthenticated } = require("../middleware/auth");
const multer = require('multer'); // Import multer for file upload
const shortid = require("shortid");



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, shortid.generate() + "-" + file.originalname);
  },
});

const upload = multer({ storage });


//auth routes
// /api/signup
//router.post("/signup", signup);

// /api/signin
router.post("/signin", signin);

router.post("/signup", upload.single('cv'), signup);


// /api/logout
router.get("/logout", logout);

// /api/me
router.get("/me", isAuthenticated, userProfile);

module.exports = router;
