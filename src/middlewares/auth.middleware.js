// for identify the user
const jwt = require ("jsonwebtoken") 

// For checking the token that is it blacklisted
const tokenBlacklistModel = require("../models/blacklisting.model")




async function authUser(req, res, next) {
const token = req.cookies.token                                                               // / Fetching token from the cookies

// <---If there is no token in that case--->
if (!token) {
        return res.status(401).json({
            message: "Token not provided."
        })
    }


    // Checking token Blackisting
     const isTokenBlacklisted = await tokenBlacklistModel.findOne({
        token
    })
    if (isTokenBlacklisted) {
        return res.status(401).json({
            message: "token is invalid"
        })
    }



    // <-----If there is token:----->
                                                                                                // note : verify is method to identify the correctness of the token by taking token and JWT_SECRET in args
                                                                                               // in try, verify the  available token and if it correct then use next() unless use catch 

        try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = decoded

        next()

    } catch (err) {

        return res.status(401).json({
            message: "Invalid token."
        })
    }

}
module.exports = { authUser }
