import { asyncHandler } from '../utils/asyncHandler.js'
import  {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"


const generateAcessAndRefreshTokens = async(userId)=> {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAcessToken()
        const refreshToken = user.generateRefreshToken()

        //generated tokens and we need to send it
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken,refreshToken}



    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating tokens")
    }
}

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

   const existedUser = await User.findOne({
        $or: [{username}, {email},{fullName}]
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
            const createdUser = await User.findById(user._id).select(
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

                //login user
                const loginUser = asyncHandler(async(req,res) =>{
                  //req body -> data
                  //username email access
                  //find the user
                  //password check
                  //if pass exists then accesstoken and refresh token
                  //send tokens as secure cookie

                  const {email,username,password} = req.body

                  if(!username || !email){
                    throw new ApiError(400, "username or password is required")
                  }

                  const user = await User.findOne({
                    $or: [{username},{email}]
                  })

                  if(!user)
                    {
                        throw new ApiError(404,"User does not exist")
                    }

                    //to check for password to bcrypt

                    const isPasswordValid = await user.isPasswordCorrect(password)

                    if(!isPasswordValid)
                        {
                            throw new ApiError(404,"Invalid user credentials")
                        }

                      const{accessToken,refreshToken} =  await  generateAcessAndRefreshTokens(user._id)

                      //to send cookie
                     const loggedInUser =  User.findById(user._id).
                     select("-password -refreshToken")

                     const options = {
                        httpOnly: true,
                        secure: true
                     }
                     return res.status(200).
                     cookie("accessToken",accessToken,options).
                     cookie("refreshToken",refreshToken,options).
                     json(
                        new ApiResponse(
                            200,
                            {
                                user: loggedInUser,accessToken,
                                refreshToken
                            },
                            "User logged in successfully"
                        )
                     )







                })

              const logoutUser = asyncHandler(async(req,res)=>{

              })  



            



export {registerUser,loginUser}