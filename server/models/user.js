const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema;
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken");



const jobHistorySchema = new mongoose.Schema({
    title: {
        type:String,
        trim: true,
        maxlength:70,
    },
    description: {
        type:String,
        trim: true,
    },
    salary: {
        type:String,
        trim: true,
    },
    location: {
        type:String,
    },
    interviewDate: {
        type: Date,
    },
    applicationStatus: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    user: {
        type:ObjectId,
        ref:"User",
        required: true,
    },

},{timestamps: true})


const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      required: function () {
        return this.role === "user" || this.role === "admin";
      },
      maxlength: 32,
    },
    lastName: {
      type: String,
      trim: true,
      required: function () {
        return this.role === "user" || this.role === "admin";
      },
      maxlength: 32,
    },
    userName: {
      type: String,
      trim: true,
      required: function () {
        return this.role === "company";
      },
      maxlength: 32,
    },
    email: {
      type: String,
      trim: true,
      required: [true, "email is required"],
      unique: true,
      match: [
        /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      trim: true,
      required: [true, "password is required"],
      minlength: [6, "password must be at least 6 characters"],
    },
    jobHistory: [jobHistorySchema],
    role: {
      type: String,
      enum: ["user", "admin", "company"],
      default: "admin",
    },
    cv: {
      type: String, // Store the path to the uploaded CV file
    },
    year: {
      type: String,
      enum: ["first", "second", "third", "fourth", "fifth"],
      required: function () {
        return this.role === "user";
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
      // Only require specialization for fourth and fifth year students
      required: function () {
        return this.role === "user" && ["fourth", "fifth"].includes(this.year);
      },
    },
  },
  { timestamps: true }
);


//encrypting password before saving
userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        next();
    }
    this.password = await bcrypt.hash(this.password, 10)
})

// compare user password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

// return a JWT token
userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
        expiresIn: 3600
    });
}

module.exports = mongoose.model("User", userSchema);