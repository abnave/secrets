//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
const mongoose = require('mongoose');
// const passport = require('mongoose');
// const passportLocal = require('passport-local');
// const passportLocalMongoose = require('passport-local-mongoose');
// const expressSession = require('express-session');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const mencrypt = require('mongoose-encryption');
const url = "mongodb://localhost:27017";
const dbName = "userDB";
mongoose.connect(url + "/" + dbName, { useNewUrlParser: true, useUnifiedTopology: true }, function (err) {
    if (err)
        console.log(err);
    else
        console.log("Connected succesfully to the userDB");
});



app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));



const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});
//userSchema.plugin(mencrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });


const User = new mongoose.model("User", userSchema);
app.get("/", function (req, res) {
    res.render("home");
});
app.get("/login", function (req, res) {
    res.render("login");
});
app.get("/register", function (req, res) {
    res.render("register");
});
app.post("/register", function (req, res) {
    bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
        // Store hash in your password DB.
        const newUser = new User({
            username: req.body.username,
            password: hash
        });
        newUser.save(function (err) {
            if (!err) {
                res.render("secrets");
            } else {
                console.log(err);
                res.send(err);
            }
        });
    });


});

app.post("/login", function (req, res) {
    User.findOne({ username: req.body.username }, function (err, foundUser) {
        if (!err) {
            if (foundUser) {
                bcrypt.compare(req.body.password, foundUser.password, function (err, result) {
                    if (result == true) {
                        res.render("secrets");
                    }
                    else {
                        console.log("Incorrect Password");
                    }
                });
            } else {
                console.log("User not found");
            }
        } else {
            console.log(err);
        }
    });
});
// app.get("/secrets", function (req, res) {
//     res.render("secrets");
// });

app.listen(3000, function () {
    console.log("Secrets Server started on port 3000");
});
