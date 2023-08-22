const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "Title is required"],
      maxlength: 70,
    },
    description: {
      type: String,
      trim: true,
      required: [true, "Description is required"],
    },
    salary: {
      type: String,
      trim: true,
      required: [true, "Salary is required"],
    },
    location: {
      type: String,
    },
    available: {
      type: Boolean,
      default: true,
    },
    JobType: {
      type: ObjectId,
      ref: "JobType",
      required: true,
    },
    user: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    year: {
      type: String,
      enum: ["first", "second", "third", "fourth", "fifth"],
      required: function () {
        return this.available === true; // Optional: Only require year if the job is available
      },
    },
    specialization: {
      type: String,
      enum: [
        null, // Allow null value
        "CLOUD",
        "TWIN",
        "DS",
        "SIM",
        "BI",
        "SAE",
        "WIN",
        "IOSYS",
        "SLEAM",
        "INFINI",
        "GAMIX",
        "NIDS",
        "SE",
      ],
      // Optional: Only require specialization for jobs targeting fourth and fifth year students
      required: function () {
        return (
          this.year &&
          ["fourth", "fifth"].includes(this.year) &&
          this.available === true
        );
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
