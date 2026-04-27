const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklisting.model")

async function authUser(req, res, next) {
    try {
        // Log to check if cookies are reaching the server
        console.log("🔍 Auth Middleware - Cookies received:", req.cookies)
        console.log("🔍 Auth Middleware - Request origin:", req.get('origin'))
        console.log("🔍 Auth Middleware - Headers:", req.headers)
        
        const token = req.cookies.token

        if (!token) {
            console.log("❌ No token found in cookies")
            return res.status(401).json({
                message: "Token not provided."
            })
        }

        console.log("✅ Token found, verifying...")
        const isTokenBlacklisted = await tokenBlacklistModel.findOne({ token })
        if (isTokenBlacklisted) {
            console.log("❌ Token is blacklisted")
            return res.status(401).json({
                message: "token is invalid"
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        console.log("✅ Token verified, user ID:", decoded.id)
        req.user = decoded
        next()
    } catch (err) {
        console.error("❌ AUTH ERROR:", err.message)
        return res.status(401).json({
            message: "Invalid token."
        })
    }
}
module.exports = { authUser }