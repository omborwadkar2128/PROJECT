if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.log(err)
    });

async function main(){
    await mongoose.connect(MONGO_URL);
}

app.set("view engine" , "ejs");
app.set("views" , path.join(__dirname , "views"));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.engine("ejs" , ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const sessionOptions = {
    secret : "mysupersecretcode",
    resave : false,
    saveUninitialized : true,
    cookie: {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true,
    },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req , res , next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/demouser" , async (req , res) => {
//     let fakeUser = new User({
//         email: "abc@gmail.com" ,
//         username : "demouser",
//     });

//     let registeredUser = await User.register(fakeUser , "helloworld");
//     res.send(registeredUser);
// });

app.get("/" , (req , res) => {
    res.send("Hi , I am root");
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews" , reviewRouter);
app.use("/" , userRouter);


app.all("*" , (req , res , next) => {
    next(new ExpressError(404 , "Page Not Found!"));
});

app.use((err , req , res , next) => {
    let {statusCode = 500 , message = "something went wrong!"} = err;
    res.status(statusCode).render("error.ejs" , { message });
    // res.status(statusCode).send(message);
});

app.listen(3000 , () => {
    console.log("Server is running on port 3000");
});








// app.get("/testListing" , async (req , res) => {
//     let sampleListing = new Listing({
//         title : "My new Villa",
//         description : "This is a beautiful villa with a pool",
//         price : 12000,
//         location : "clangut , goa",
//         country : "India",
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successfull testing");
// });