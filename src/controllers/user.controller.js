import { asyncHandler } from '../utils/asyncHandler.js'
import  {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"


const registerUser = asyncHandler(async(req,res)=> 
{
    //get user details from frontend
    //validation - not empty
    //check if user already exists
    //check for images
    //check for avatar
    //upload to cloudinary

    //cloudary response gives an url
    //create user object to create entry in db
    //remove password and refresh token from response
    //check if res for user creation
    //return res
//data in req body

   const {fullName, email, username, password} = req.body;
   console.log("email :", email);

  /* if(fullName === "")
    {
        throw new ApiError(400, "fullname is required") 

    }*/
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }  

   const existedUser =  User.findOne({
        $or: [{username}, {email}]
    })

    if(existedUser)
        {
            throw new ApiError(409,"User exists")
        }

        //checking images

        const avatarLocalPath = req.files?.avatar[0]?.path;
        const coverImageLocalPath = req.files?.coverImage[0]?.path;

        //checking avatar
        if (!avatarLocalPath) {
            throw new ApiError(400,"Avatar file is required")
        } 

        //uploading on cloudinary
        const avatar = await uploadOnCloudinary(avatarLocalPath)
        const coverImage = await uploadOnCloudinary(coverImageLocalPath)

        if(!avatar)
            {
                throw new ApiError(400,"Avatar file is required")
            }

            //object banao database me entry mardo
            const user = await User.create(
                {
                    fullName,
                    avatar: avatar.url,
                    coverImage: coverImage?.url || "",
                    email,
                    password,
                    username: username.toLowerCase()
                }
            )
             createdUser = await User.findById(user._id).select(
                "-password -refreshToken"
             )
             if(!createdUser)
                {
                    throw new ApiError(500, "Something went wrong while registering")
                }
                //returning
                return res.status(201).json(
                    new ApiResponse(200,createdUser,"user registered successfully")
                )


            

})

export {registerUser}