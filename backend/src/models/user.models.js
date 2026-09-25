import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
    },

    username: {
      type: String,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    bio: {
      type: String,
      default: "",
    },

    profileimage: {
      type: String,
      default: "",
    },

    profileimagepublicid: {
      type: String,
      default: "",
    },

    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],

    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],

    savedposts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "post",
      },
    ],

    // Refresh token
    refreshToken: {
      type: String,
      default: "",
    },

 
    resetPasswordToken: {
      type: String,
      default: "",
    },

    
    resetPasswordExpiry: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);


// Hash password before saving
userSchema.pre("save", async function (next) {

  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);

  next();
});


// Check password
userSchema.methods.isPasswordCorrect = async function (password) {

  return await bcrypt.compare(
    password,
    this.password
  );
};


// Generate Access Token
userSchema.methods.generateAccessToken = function () {

  return jwt.sign(
    {
      id: this._id,
      username: this.username,
      email: this.email,
    },

    process.env.ACCESS_TOKEN_SECRET,

    {
      expiresIn: "1h",
    }
  );
};


// Generate Refresh Token
userSchema.methods.generateRefreshToken = function () {

  return jwt.sign(
    {
      id: this._id,
    },

    process.env.REFRESH_TOKEN_SECRET,

    {
      expiresIn: "7d",
    }
  );
};


const User = mongoose.model("user", userSchema);

export default User;