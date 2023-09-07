const User = require("../models/user");
const ErrorResponse = require("../utils/errorResponse");
const Job = require("../models/jobModel");
const SibApiV3Sdk = require('sib-api-v3-sdk'); // Import the SendinBlue API library


//load all users
exports.allUsers = async (req, res, next) => {
    //enable pagination
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;
    const count = await User.find({}).estimatedDocumentCount();

    try {
        const users = await User.find().sort({ createdAt: -1 }).select('-password')
            .skip(pageSize * (page - 1))
            .limit(pageSize)

        res.status(200).json({
            success: true,
            users,
            page,
            pages: Math.ceil(count / pageSize),
            count

        })
        next();
    } catch (error) {
        return next(error);
    }
}

//show single user
exports.singleUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
        res.status(200).json({
            success: true,
            user
        })
        next()
    } catch (error) {
        return next(error);
    }
}

//edit user
exports.editUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id , req.body, { new: true })
        res.status(200).json({
            success: true,
            user
        })
        next()
    } catch (error) {
        return next(error);
    }
}

//delete user
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndRemove(req.params.id)
        res.status(200).json({
            success: true,
            message: "User Deleted"
        })
        next()
    } catch (error) {
        return next(error);
    }
}


//jobs history
// exports.createUserJobHistory = async (req, res, next) => {
//     const {title, description, salary, location} = req.body;
//     try {
//         const currentUser = await User.findOne({_id: req.user._id})
//         if (!currentUser) {
//             return next(new ErrorResponse("You Must Log In To Apply",401));
//         }else {
//             const addJobHistory = {
//                 title,
//                 description,
//                 salary,
//                 location,
//                 user: req.user._id
//             }
//             currentUser.jobHistory.push(addJobHistory)
//             await currentUser.save()
//         }
//         res.status(200).json({
//             success: true,
//             currentUser
//         })
//         next()
//     } catch (error) {
//         return next(error);
//     }
// }
exports.createUserJobHistory = async (req, res, next) => {
  const { title, description, salary, location, jobId } = req.body; // Add jobId to the destructuring

  try {
    const currentUser = await User.findOne({ _id: req.user._id });
    if (!currentUser) {
      return next(new ErrorResponse("You Must Log In To Apply", 401));
    } else {
      const addJobHistory = {
        title,
        description,
        salary,
        location,
        user: req.user._id,
        job: jobId, // Add the jobId to the job history entry
      };
      currentUser.jobHistory.push(addJobHistory);
      await currentUser.save();
    }
    res.status(200).json({
      success: true,
      currentUser,
    });
    next();
  } catch (error) {
    return next(error);
  }
};


// Controller function to get users who applied to a specific job
exports.getUsersAppliedToJob = async (req, res, next) => {
  try {
    const jobId = req.params.job_id; // Get the job ID from the request parameters

    // Find users who have the given job ID in their job history
    const appliedUsers = await User.find({
      "jobHistory.job": jobId,
    });

    res.status(200).json({
      success: true,
      users: appliedUsers,
    });
  } catch (error) {
    next(error);
  }
};


// exports.updateUserApplicationStatus = async (req, res, next) => {
//   try {
//     const userId = req.params.userId;
//     const jobId = req.params.jobId;
//     const { applicationStatus } = req.body;

//     // Find the user and their job history entry
//     const user = await User.findById(userId);

//     // Find the job history entry with the given jobId
//     const jobHistoryEntry = user.jobHistory.find(
//       (job) => job._id.toString() === jobId
//     );

//     if (!jobHistoryEntry) {
//       return res.status(404).json({ error: "Job history entry not found." });
//     }

//     // Update the application status
//     jobHistoryEntry.applicationStatus = applicationStatus;
//     await user.save();

//     res.status(200).json({ success: true });
//   } catch (error) {
//     next(error);
//   }
// };

exports.updateUserApplicationStatus = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const jobId = req.params.jobId;
    const { applicationStatus } = req.body;

    // Find the user and their job history entry
    const user = await User.findById(userId);

    // Find the job history entry with the given jobId
    const jobHistoryEntry = user.jobHistory.find(
      (job) => job._id.toString() === jobId
    );

    if (!jobHistoryEntry) {
      return res.status(404).json({ error: "Job history entry not found." });
    }

    // Save the original application status for comparison
    const originalStatus = jobHistoryEntry.applicationStatus;

    // Update the application status
    jobHistoryEntry.applicationStatus = applicationStatus;
    await user.save();

    // Check if the application status has changed
    if (applicationStatus !== originalStatus) {
      // Send an email to the user about the status change
      const sendSmtpEmailsApi = new SibApiV3Sdk.TransactionalEmailsApi();

      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      sendSmtpEmail.subject = "Your Job";
      sendSmtpEmail.htmlContent = `<html><body><p>Your application status has been updated to: ${applicationStatus}</p></body></html>`;
      sendSmtpEmail.sender = {
        name: "Your Company",
        email: "yourcompany@example.com",
      };
      sendSmtpEmail.to = [{ email: user.email, name: user.name }];
      sendSmtpEmail.replyTo = {
        email: "replyto@yourcompany.com",
        name: "Your Company",
      };

      try {
        await sendSmtpEmailsApi.sendTransacEmail(sendSmtpEmail);
        console.log("Email sent to:", user.email);
      } catch (error) {
        console.error("Error sending email to", user.email, ":", error);
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

// exports.getUsersAppliedToJob = async (req, res, next) => {
//   try {
//     const jobId = req.params.job_id;

//     // Find users who applied to the job using the job's ObjectId
//     const appliedUsers = await User.find({
//       "jobHistory._id": jobId,
//     });

//     res.status(200).json({
//       success: true,
//       users: appliedUsers,
//     });
//   } catch (error) {
//     next(error);
//   }
// };