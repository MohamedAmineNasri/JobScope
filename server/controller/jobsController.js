const Job = require("../models/jobModel");
const JobType = require("../models/jobTypeModel");
const ErrorResponse = require("../utils/errorResponse");

//create job 
exports.createJob = async (req, res, next) => {
  try {
    const job = await Job.create({
      title: req.body.title,
      description: req.body.description,
      salary: req.body.salary,
      location: req.body.location,
      available: req.body.available,
      JobType: req.body.JobType,
      user: req.user.id,
    });
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
