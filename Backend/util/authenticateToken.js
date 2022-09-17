const jwt = require("jsonwebtoken");
require("dotenv").config();

const authToken = async (req, res, next) => {
    const token = req.header("x-auth-token");
    console.log(token);

    // Check token
    if (!token) {
        console.log("-> Token not found")
        res.status(401).send("Token not found");
    }
    else {
        // Authenticate token
        try {
            const user = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            req.username = user.username;
            next();
        } catch (error) {
            console.log(error);
            console.log("-> Invalid token")
            res.status(403).send("Invalid token");
        }
    }
};

module.exports = authToken;
