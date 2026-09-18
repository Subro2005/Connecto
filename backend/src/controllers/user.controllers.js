import user from "../models/user.models.js"
import {Apierror} from "../utils/Apierror.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asynchandler.js"

const registeruser=asyncHandler(async (req,res)=>{

    const {username,email,password}=req.body

    if(!username || !email || !password){
        throw new Apierror(404,"This filled is required")
    }

const existeduser = await user.findOne({ username })
    if(existeduser){
        throw new Apierror(404,"Username already existed")
    }

    const newuser=await user.create({username,email,password})

    const createduser= await user.findById(newuser._id).select("-password")

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

    const newuser = await user
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

    newuser.refreshtokens = refreshToken;

    await newuser.save({
        validateBeforeSave: false
    });

    const loggedinuser = await user
        .findById(newuser._id)
        .select("-password -refreshtokens");

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


export {registeruser,loginuser}