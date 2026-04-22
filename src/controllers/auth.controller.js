const userModel = require ("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklisting.model");

/**
 *@name registerUserController
 @description register a new user , expects username , email and password  in the request 
 * @accesss 
 */
async function registerUserController(req,res){
    const {username , email , password} = req.body
    if(!username || !email || !password){
        return res.status(400).json ({
            message:"Please provide username , email and password "
        })
    }

    const isUserAlreadyExists = await userModel.findOne({
        $or: [{username} ,  {email}]                                                      // $or : it is a mongoDB operator which helps to creates  multiples condition inside the array . It will be true if any one looks postive value  .Here I have awaits the username and email objects from the userModel  
    })

    // If User is exist already in that  case :--
    if(isUserAlreadyExists) {
        return res.status(400).json({
            message:"Account is already  exist with  this email adress and username"
        })
    }

    // if User isn't Exist in that case :----

    // creates the hash value 
    const hash = await bcrypt.hash(password, 10)                                             // You can see that the it takes password from the userModel and apply 10 charecters for hashing on it 

    // <--------------------CREATING THE USER (REGISTRATION)------------------------------------------>

    // Create user:This part saves the new user in the database
    const user = await userModel.create({
        username,
        email,
        password: hash                                                                      // you can see that I have taken the ussername and email from the  userModel  and password by using hash variable 
    })

    // Create token:This part makes the JWT token after signup:
        const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "15d" }
    )

   // Send token and response:This part stores the token in a cookie and sends success response:
    res.cookie("token", token)
    res.status(201).json({
        message: "User registered successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })

}


// <--------------LOGIN USER--------------------->
/**
 * @name loginUserController
 * @description login a user, expects email and password in the request body
 * @access Public
 */
async function loginUserController(req, res) {

    const { email, password } = req.body

    const user = await userModel.findOne({ email })

    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)                  // password --> recive from req.body and user.password ----> from the dataBase

    // PassWord isn't valid in that case :---

    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    // Password is valid in that case :---

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "15d" }
    )

    res.cookie("token", token)
    res.status(200).json({
        message: "User loggedIn successfully.",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}

//<--------- LOGOUT ------------>

/**
 * @name logoutUserController
 * @description clear token from user cookie and add the token in blacklist
 * @access public
 */
async function logoutUserController(req, res) {
    const token = req.cookies.token                                                     // fetching token from the cookie 
    if (token) {
        await tokenBlacklistModel.create({ token })                                    // if we findout the token then it will be blacklisted
    }

    res.clearCookie("token")

    res.status(200).json({
        message: "User logged out successfully"
    })
}

/**
 * @name getMeController
 * @description get the current logged in user details.
 * @access private
 */
async function getMeController(req, res) {

    const user = await userModel.findById(req.user.id)                               // this req.user is comming from the authRouter.middleware.js ==> req.user = decoded


    res.status(200).json({
        message: "User details fetched successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })

}

module.exports = {registerUserController,loginUserController,logoutUserController,getMeController}