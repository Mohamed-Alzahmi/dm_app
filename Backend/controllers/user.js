const User = require('../models/user'); //user model
const bcrypt = require('bcrypt'); // this package is used for hashing.
const mysql = require('mysql2'); //used for mysql calls
const config = require('../config/config.json'); //used to get db details
const generateAccessTokens = require("../util/generateAccessToken"); //used for login token

//create mysql pool to connect to MySQL db
const db = mysql.createPool({
    connectionLimit: config.connectionLimit,
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database
});
// master function to run an sql command 
// no need to repeat the code 
// applied in any DB call 

selectAllUsers = (query) => {
    return new Promise((resolve, reject) => {
        const formatted_query = mysql.format(query);
        db.query(formatted_query, (error, results) => {
            if (error) {
                return reject(error);
            }
            return resolve(results);
        });
    });
};

runDBCommand = (query) => {
    return new Promise((resolve, reject) => {
        console.log(query)
        db.query(query, (error, results) => {
            if (error) {
                return reject(error);
            }
            return resolve(results);
        });
    });
};
//create new user
exports.createUser = async (req, res, next) => {
    try {
        console.log("creating user...");
        //use the following items to create a new user
        username = req.body.username;
        password = await bcrypt.hash(req.body.password, 10); //use bcrypt to encrypt the passwords, can add password salting later for more secure login
        email = req.body.email;
        mobile = req.body.mobile;
        postcode = req.body.postcode;
        console.log(req.body)
        const permission = 0; //admin is 1, user is 0
        const searchradius = 100; //default search radius (km)
        const active = 1; //user is active (1)
        // the function accepts query and paramters 
        // const sqlAllUsers = "SELECT * FROM users";
        // const resultAllUsers = await selectAllUsers(sqlAllUsers) 
        // console.log(resultAllUsers.length) 
        const sqlSearch = "SELECT * FROM users WHERE username = ?";
        const params = [username]
        const formatted_query = mysql.format(sqlSearch, params);
        const result = await runDBCommand(formatted_query);
        console.log(result.length)
        if (result.length != 0) {
            console.log("-> User already exists")
            res.status(404).send("User already exists");
        }
        else {
            //sql insert query
            const sqlInsert = "INSERT INTO users (username, password, email, mobile, permission, postcode, searchradius, active) VALUES (?,?,?,?,?,?,?,?)"
            const params = [username, password, email, mobile, permission, postcode, searchradius, active]
            const formatted_query = mysql.format(sqlInsert, params);
            console.log(formatted_query)
            const resultInsertUser = await runDBCommand(formatted_query);
            if (resultInsertUser.length != 0) {
                console.log("--> Created new User")
                console.log(resultInsertUser.insertId)
                res.status(200).send("User created successfully");
            }
            else {
                res.status(404).send("User not created!");
            }
        }
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}
//log in
exports.Login = async (req, res, next) => {
    try {
        //user details
        username = req.body.username;
        password = req.body.password;

        const sqlSearch = "SELECT * FROM users WHERE username = ?";
        const params = [username]
        const formatted_query = mysql.format(sqlSearch, params);
        const result = await runDBCommand(formatted_query);
        console.log(result.length)
        if (result.length == 0) {
            console.log("-> User does not exist");
            res.status(404).send("Username does not exist");
        }
        else {
            //if there is a result
            const hashedPassword = result[0].password
            //get the hashedPassword from result
            if (bcrypt.compare(password, hashedPassword)) {
                //generate access token
                console.log("--> Login Successful")
                console.log("--> Generating accessToken")
                //console.log(result[0].id);
                process.env.USERID = result[0].id;
                process.env.USER = username;
                const accessToken = generateAccessTokens({ username: username })
                console.log({ accessToken: accessToken })
                //used for /routes/receipt.js
                res.status(200).send("Login successful, token: " + accessToken.toString());
            }
            else {
                console.log("-> Password Incorrect")
                res.status(403).send("Password Incorrect!");
            }

        }

    } catch (err) {
        console.log("error:", err);
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

//reset password
exports.ResetPassword = async (req, res, next) => {
    try {
        //user details
        username = req.body.username;
        password = req.body.password;
        newpassword = await bcrypt.hash(req.body.newpassword, 10);

        const sqlSearch = "SELECT * FROM users WHERE username = ?";
        const params = [username]
        const formatted_query = mysql.format(sqlSearch, params);
        const resultSearch = await runDBCommand(formatted_query);
        if (resultSearch.length == 0) {
            console.log("-> User does not exist");
            res.status(404).send("Username does not exist");
        }
        else {
            //if there is a result
            const hashedPassword = resultSearch[0].password
            //get the hashedPassword from result
            if (bcrypt.compare(password, hashedPassword)) {
                //generate access token
                console.log("--> Password reset")

                const sqlUpdate = "UPDATE users SET password = ? WHERE username = ?"
                const params = [newpassword, username]
                const formatted_query = mysql.format(sqlUpdate, params);
                const resultUpdate = await runDBCommand(formatted_query);
                console.log(resultUpdate);
                if (resultUpdate.length == 0) {
                    console.log("-> Error resetting password")
                    res.status(404).send("Error resetting password");
                }
                else {
                    res.status(200).send("Password reset seccessfully");
                }

            }
            else {
                console.log("-> Password Incorrect")
                res.status(403).send("Password Incorrect!");
            }
        }
    } catch (err) {
        console.log("error:", err);
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}
//update user info
exports.UpdateUserInfo = async (req, res, next) => {
    try {
        //user details
        console.log("Updating user...");
        //use the following items to create a new user
        username = req.body.username;
        password = req.body.password;
        email = req.body.email;
        mobile = req.body.mobile;
        postcode = req.body.postcode;

        const sqlSearch = "SELECT * FROM users WHERE username = ?";
        const params = [username]
        const formatted_query = mysql.format(sqlSearch, params);
        const resultSearch = await runDBCommand(formatted_query);
        if (resultSearch.length == 0) {
            console.log("-> User does not exist");
            res.status(404).send("Username does not exist");
        }
        else {
            //if there is a result
            const hashedPassword = resultSearch[0].password
            //get the hashedPassword from result
            if (bcrypt.compare(password, hashedPassword)) {
                console.log("-> Updating user.");
                //get the hashedPassword from result 
                const sqlUpdate = "Update users set email = ?, mobile = ? , postcode = ? where username = ?"
                const params = [email, mobile, postcode, username]
                const formatted_query = mysql.format(sqlUpdate, params);
                const resultUpdate = await runDBCommand(formatted_query);

                if (resultUpdate.length == 0) {
                    console.log("-> Error updating user")
                    res.status(404).send("Error updating user");
                }
                else {
                    res.status(200).send("User updated seccessfully");

                }

            }
        }
    }
    catch (err) {
        console.log("error:", err);
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}
