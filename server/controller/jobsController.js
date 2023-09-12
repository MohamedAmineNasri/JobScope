const Job = require("../models/jobModel");
const JobType = require("../models/jobTypeModel");
const ErrorResponse = require("../utils/errorResponse");
const nodemailer = require('nodemailer');
const User = require("../models/user");
const smtpTransport = require("nodemailer-smtp-transport");
const SibApiV3Sdk = require("sib-api-v3-sdk");
const defaultClient = SibApiV3Sdk.ApiClient.instance;


// Set your SendinBlue API key
let apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = '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';


exports.createJob = async (req, res, next) => {
  try {
    const { title, description, salary, location, available, JobType } =
      req.body;
    const year = req.body.year;
    let specialization = null;
    if (["fourth", "fifth"].includes(year)) {
      specialization = req.body.specialization;
    }

    const job = await Job.create({
      title,
      description,
      salary,
      location,
      available,
      JobType,
      user: req.user.id,
      year,
      specialization,
    });

    // Update the user's createdJobs array with the new job's ObjectId
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { createdJobs: job._id } },
      { new: true }
    );

    // Fetch matching users
    const matchingUsers = await User.find({
      year: year,
      specialization: specialization,
    });

    // Send transactional emails to matching users using SendinBlue API
    const sendSmtpEmailsApi = new SibApiV3Sdk.TransactionalEmailsApi();

    for (const user of matchingUsers) {
      const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
      sendSmtpEmail.subject = "New Job Offer";
      sendSmtpEmail.htmlContent = `<html><body><p>A new job offer has been created matching your year (${year}) and specialization (${specialization}). Check it out!</p></body></html>`;
      sendSmtpEmail.sender = {
        name: "Your Company",
        email: "yourcompany@example.com",
      };
      sendSmtpEmail.to = [{ email: user.email, name: user.name }]; // Assuming user.name is available
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

    res.status(201).json({
      success: true,
      job,
    });
  } catch (error) {
    next(error);
  }
};



// //single job
exports.singleJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    next(error);
  }
};

// //update job  by id
exports.updateJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.job_id, req.body, {
      new: true,
    })
      .populate("JobType", "jobTypeName")
      .populate("user", "firstName lastName");
    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    next(error);
  }
};

// Update job availability by ID
exports.updateAvailability = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.job_id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    job.available = req.body.available; // Update availability based on the request body
    await job.save();

    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    next(error);
  }
};


//update job by id.
exports.showJobs = async (req, res, next) => {

    //enable search 
    const keyword = req.query.keyword ? {
        title: {
            $regex: req.query.keyword,
            $options: 'i'
        }
    } : {}


    // filter jobs by category ids
    let ids = [];
    const jobTypeCategory = await JobType.find({}, { _id: 1 });
    jobTypeCategory.forEach(cat => {
        ids.push(cat._id);
    })

    let cat = req.query.cat;
    let categ = cat !== '' ? cat : ids;


    //jobs by location
    let locations = [];
    const jobByLocation = await Job.find({}, { location: 1 });
    jobByLocation.forEach(val => {
        locations.push(val.location);
    });
    let setUniqueLocation = [...new Set(locations)];
    let location = req.query.location;
    let locationFilter = location !== '' ? location : setUniqueLocation;

  //enable pagination
  const pageSize = 5;
  const page = Number(req.query.pageNumber) || 1;
 // const count = await Job.find({}).estimatedDocumentCount();
  const count = await Job.find({ ...keyword, JobType: categ }).countDocuments();
  // const count = await Job.find({
  //   ...keyword,
  //   JobType: categ,
  //   location: locationFilter,
  // }).countDocuments();

  try {
    //const jobs = await Job.find({ ...keyword, jobType: categ, location: locationFilter })
    const jobs = await Job.find({
      ...keyword,
      JobType: categ
      // location: locationFilter,
    })
      //.sort({ createdAt: -1 })
      //.populate("JobType", "jobTypeName")
      //.populate("user", "firstName")
      .skip(pageSize * (page - 1))
      .limit(pageSize);
    res.status(200).json({
      success: true,
      jobs,
      page,
      pages: Math.ceil(count / pageSize),
      count,
      setUniqueLocation,
      
    });
  } catch (error) {
    next(error);
  }
};
exports.showJobsAll = async (req, res, next) => {
  //enable search
  const keyword = req.query.keyword
    ? {
        title: {
          $regex: req.query.keyword,
          $options: "i",
        },
      }
    : {};

  // filter jobs by category ids
  let ids = [];
  const jobTypeCategory = await JobType.find({}, { _id: 1 });
  jobTypeCategory.forEach((cat) => {
    ids.push(cat._id);
  });

  let cat = req.query.cat;
  let categ = cat !== "" ? cat : ids;

  //jobs by location
  let locations = [];
  const jobByLocation = await Job.find({}, { location: 1 });
  jobByLocation.forEach((val) => {
    locations.push(val.location);
  });
  let setUniqueLocation = [...new Set(locations)];
  let location = req.query.location;
  let locationFilter = location !== "" ? location : setUniqueLocation;

  //enable pagination
  const pageSize = 5;
  const page = Number(req.query.pageNumber) || 1;
  // const count = await Job.find({}).estimatedDocumentCount();
  const count = await Job.find({ ...keyword, JobType: categ }).countDocuments();
  // const count = await Job.find({
  //   ...keyword,
  //   JobType: categ,
  //   location: locationFilter,
  // }).countDocuments();

  try {
    //const jobs = await Job.find({ ...keyword, jobType: categ, location: locationFilter })
    const jobs = await Job.find({
      ...keyword,
      JobType: categ,
      // location: locationFilter,
    })
      //.sort({ createdAt: -1 })
      //.populate("JobType", "jobTypeName")
      //.populate("user", "firstName")
      .skip(pageSize * (page - 1))
      //.limit(pageSize);
    res.status(200).json({
      success: true,
      jobs,
      page,
      pages: Math.ceil(count / pageSize),
      count,
      setUniqueLocation,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a job by ID
// Delete a job by ID
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndRemove(req.params.job_id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (error) {
    next(new ErrorResponse("server error", 500));
  }
};






// exports.deleteJob = async (req, res, next) => {
//   try {
//     const job = await Job.findByIdAndRemove(req.params._id);
//     res.status(200).json({
//       success: true,
//       message: "Job deleted successfully",
//     });
//   } catch (error) {
//     next(new ErrorResponse("server error", 500));
//   }
// };





// delete with the condition of only the one who created it can delete it :
// Delete a job by ID
// exports.deleteJob = async (req, res, next) => {
//   try {
//     const job = await Job.findById(req.params.id);

//     if (!job) {
//       return res.status(404).json({
//         success: false,
//         message: 'Job not found',
//       });
//     }

//     // Ensure that only the user who created the job can delete it
//     if (job.user.toString() !== req.user.id) {
//       return res.status(403).json({
//         success: false,
//         message: 'You are not authorized to delete this job',
//       });
//     }

//     await job.remove();

//     res.status(200).json({
//       success: true,
//       message: 'Job deleted successfully',
//     });
//   } catch (error) {
//     next(error);
//   }
// };
