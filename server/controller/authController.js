const user = require('../models/user');
const User = require('../models/user')
const ErrorResponse = require ('../utils/errorResponse')


//authController

exports.signup = async (req, res, next) => {
  const { email } = req.body;
  try {
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({
        success: false,
        message: "E-mail already registered",
      });
    }

    const { firstName, lastName, password, role, year } = req.body;

    const cv = req.file ? req.file.path : null;

    let specialization = null; // Default to no specialization
    if (["fourth", "fifth"].includes(year)) {
      specialization = req.body.specialization; // Assign specialization if in fourth or fifth year
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
      cv,
      year,
      specialization,
    });

    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};


exports.signupCompany = async (req, res, next) => {
  const { email } = req.body;
  try {
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({
        success: false,
        message: "E-mail already registered",
      });
    }

    const { userName, password, role } = req.body;

    // Additional fields for company signup
    // ...

    const user = await User.create({
      userName,
      email,
      password,
      role,
      // Additional fields for company signup
      // ...
    });

    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};



exports.signin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        //validation
        if (!email) {
        return next(new ErrorResponse("please add an email", 403));
        }
        if (!password) {
        return next(new ErrorResponse("please add a password", 403));
        }

        //check user email
        const user = await User.findOne({ email });
        if (!user) {
        return next(new ErrorResponse("invalid credentials", 400));
        }
        //check password
        const isMatched = await user.comparePassword(password);
        if (!isMatched) {
        return next(new ErrorResponse("invalid credentials", 400));
        }

        sendTokenResponse(user, 200, res);
    } catch (error) {
        next(error);
    }
};


const sendTokenResponse = async (user, codeStatus, res) => {
    const token = await user.getJwtToken();
    res
        .status(codeStatus)
        .cookie("token", token, { maxAge: 60 * 60 * 1000, httpOnly: true })
        .json({ success: true, role: user.role });
};

// log out 
exports.logout = (req, res, next) => {
    res.clearCookie('token'); // Corrected typo: remove '=' and add the correct method name
    res.status(200).json({
        success: true,
        message: "logged out"
    });
};

exports.userProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('createdJobs') // Populate the createdJobs field
      .exec();

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

