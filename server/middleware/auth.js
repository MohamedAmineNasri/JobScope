const jwt = require("jsonwebtoken");
const User = require('../models/user')
const ErrorResponse = require("../utils/errorResponse");

//check if user is authenticated
exports.isAuthenticated = async (req, res, next) => {
    const { token } = req.cookies;
    // Make sure token exists
    if (!token) {
        return next(new ErrorResponse("Not authorized to access this route", 401));
    }
    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        next();
    } catch (error) {
        return next(new ErrorResponse("Not authorized to access this route", 401));
    }
}; 

//middleware for admin 
// exports.isAdmin = (req, res, next) => {
//     if (req.user.role === "admin") {
//         // User is an admin, proceed to the next middleware or route handler
//         next();
//     } else {
//         // User is not an admin, send an error response
//         return res.status(403).json({
//             success: false,
//             error: "Not authorized to access this route as admin",
//         });
//     }
// };
//middleware for admin
exports.isAdmin = (req, res, next) => {
    if (req.user.role != "admin") {
        return next(new ErrorResponse('Access denied, you must an admin', 401));
    }
    next();
}
