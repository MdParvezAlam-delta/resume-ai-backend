const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklisting.model");

/**
 *@name registerUserController
 @description register a new user , expects username , email and password  in the request 
 * @accesss 
 */
async function registerUserController(req, res) {
    const { username, email, password } = req.body
    if (!username || !email || !password) {
        return res.status(400).json({
            message: "Please provide username , email and password "
        })
    }

    const isUserAlreadyExists = await userModel.findOne({
        $or: [{ username }, { email }]
    })

    if (isUserAlreadyExists) {
        return res.status(400).json({
            message: "Account is already  exist with  this email adress and username"
        })
    }

    const hash = await bcrypt.hash(password, 10)

    const user = await userModel.create({
        username,
        email,
        password: hash
    })

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "15d" }
    )

    const isProd = process.env.NODE_ENV === "production";

    // UPDATED COOKIE CONFIGURATION
    res.cookie("token", token, {
        httpOnly: true,
        secure: isProd,                                       // Must be true if sameSite is "none"
        sameSite: isProd ? "none" : "lax",                    // Fix: Use "lax" for localhost, "none" for production
        maxAge: 15 * 24 * 60 * 60 * 1000 // 15 days in milliseconds
    })

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
async function loginUserController(req, res) {
    const { email, password } = req.body
    const user = await userModel.findOne({ email })

    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "15d" }
    )

    // Detect if running on HTTPS (production) or HTTP (localhost)
    const isSecure = req.protocol === 'https' || process.env.NODE_ENV === 'production';

    // UPDATED COOKIE CONFIGURATION
    res.cookie("token", token, {
        httpOnly: true,
        secure: isSecure,                                      // true for HTTPS, false for HTTP localhost
        sameSite: isSecure ? "none" : "lax",                   // "none" for cross-origin, "lax" for localhost
        maxAge: 15 * 24 * 60 * 60 * 1000 
    })

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
async function logoutUserController(req, res) {
    const token = req.cookies.token
    if (token) {
        await tokenBlacklistModel.create({ token })
    }

    // Detect if running on HTTPS (production) or HTTP (localhost)
    const isSecure = req.protocol === 'https' || process.env.NODE_ENV === 'production';

    // UPDATED CLEARCOOKIE CONFIGURATION
    res.clearCookie("token", {
        httpOnly: true,
        secure: isSecure,
        sameSite: isSecure ? "none" : "lax"
    })

    res.status(200).json({
        message: "User logged out successfully"
    })
}

async function getMeController(req, res) {
    const user = await userModel.findById(req.user.id)
    res.status(200).json({
        message: "User details fetched successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}

module.exports = { registerUserController, loginUserController, logoutUserController, getMeController }