import User from "../models/user.models.js"
import {Apierror} from "../utils/Apierror.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asynchandler.js"
import jwt from "jsonwebtoken";
import crypto from "crypto"

const registeruser=asyncHandler(async (req,res)=>{

    const {username,email,password}=req.body

    if(!username || !email || !password){
        throw new Apierror(409, "Username or email already exists");
    }

const existeduser = await User.findOne({
    $or: [
        { username },
        { email }
    ]
});
    if(existeduser){
        throw new Apierror(404,"Username already existed")
    }

    const newuser=await User.create({username,email,password})

    const createduser= await User.findById(newuser._id).select("-password")

    if(!createduser){
        throw new Apierror(404, "cannot find the User")
    }

    return res
    .status(201)
    .json(new ApiResponse(201, createduser, "User registered successfully"));

})

const loginuser = asyncHandler(async (req, res) => {

    const { username, password } = req.body;

    if (!username || !password) {
        throw new Apierror(400, "Username and password are required");
    }

    const newuser = await User
        .findOne({ username })
        .select("+password");

    if (!newuser) {
        throw new Apierror(404, "User not found");
    }

    const checkuser = await newuser.isPasswordCorrect(password);

    if (!checkuser) {
        throw new Apierror(401, "Invalid credentials");
    }


    const accessToken = newuser.generateAccessToken();
    const refreshToken = newuser.generateRefreshToken();

    newuser.refreshToken = refreshToken;

    await newuser.save({
        validateBeforeSave: false
    });

    const loggedinuser = await User
        .findById(newuser._id)
        .select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedinuser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        );
});

const refreshAccessToken= asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies?.refreshToken  || req.body.refreshToken;

    if(!incomingRefreshToken){
        throw new Apierror(401,"No Refresh Token Found")
    }

   const decoded = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
);

    const user = await User.findById(decoded?.id);
    

    if(!user ||incomingRefreshToken !== user.refreshToken){
        throw new Apierror(401,"not tokens found")
    }

    const accessToken=user.generateAccessToken();
    const newrefreshToken=user.generateRefreshToken();

    user.refreshToken = newrefreshToken;

await user.save({
    validateBeforeSave: false
});

    const options={
        httpOnly:true,
        secure:true,
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newrefreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                accessToken,
                refreshToken: newrefreshToken
            },
            "Access token refreshed"
        )
    );

})


const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(req.user._id,
        {
        $unset:{
            refreshToken:1
        }
    })

    const options={
        httpOnly:true,
        secure:true,
    }

    return res
    .status(200)
    .clearCookie("refreshToken",options)
    .clearCookie("accessToken",options)
    .json(new ApiResponse(200,{},"user logout Successfully"))
})


const getCurrentUser=asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200,req.user,"user feteched successfully"))
})

const forgotPassword = asyncHandler(async (req, res) => {

    const { email } = req.body;

    if (!email) {
        throw new Apierror(400, "Email is required");
    }

    // Find the user
    const user = await User.findOne({ email });

    if (!user) {
        throw new Apierror(404, "User not found");
    }

    // 1. Create ORIGINAL reset token
    const resetToken = crypto
        .randomBytes(32)
        .toString("hex");

    // 2. Hash the reset token
    const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    // 3. Store HASHED token in MongoDB
    user.resetPasswordToken = hashedToken;

    // Token expires after 15 minutes
    user.resetPasswordExpiry =
        Date.now() + 15 * 60 * 1000;

    await user.save({
        validateBeforeSave: false
    });

    // 4. Create reset link containing ORIGINAL token
    const resetLink =
        `http://localhost:5173/reset-password/${resetToken}`;

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    resetLink
                },
                "Reset link created"
            )
        );
});

const resetPassword = asyncHandler(async (req, res) => {

    // ABC123 comes from /reset-password/ABC123
    const { token } = req.params;

    // User types this in the reset password form
    const { newPassword } = req.body;

    if (!token || !newPassword) {
        throw new Apierror(
            400,
            "Token and new password are required"
        );
    }

    // Hash ABC123 again
    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    // Find user whose stored hash matches
    // AND whose token hasn't expired
    const user = await User.findOne({
        resetPasswordToken: hashedToken,

        resetPasswordExpiry: {
            $gt: Date.now()
        }
    });

    if (!user) {
        throw new Apierror(
            400,
            "Reset token is invalid or expired"
        );
    }

    // Set new password
    user.password = newPassword;

    // Reset token cannot be used again
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;

    // Your pre("save") hashes newPassword automatically
    await user.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Password reset successfully"
            )
        );
});

export {
    registeruser,
    loginuser,
    logoutUser,
    getCurrentUser,
    refreshAccessToken,
    forgotPassword,
    resetPassword,




}