if(process.env.NODE_ENV!="production"){
require('dotenv').config();
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
const {isLoggedIn} = require("./middleware.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const user = require("./routes/user.js");
const bookingRoutes = require("./routes/bookings");



const MONGOURL = 'mongodb://127.0.0.1:27017/wanderlust';

main().then( ()=>{
    console.log("connected to db");
}).catch(err=>{
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGOURL);
}

const sessionOptions = {
    secret : "supersupersecretcode",
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires: Date.now() + 7*24*60*60*1000,
        maxAge : 7*24*60*60*1000,
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


app.use((req, res, next)=>{
     res.locals.success =  req.flash("success");
     res.locals.error =  req.flash("error");
     res.locals.CurrUser = req.user;
     next();
});

app.get("/", async(req, res)=>{
  res.render("landingpage.ejs")
});
app.get("/about", async(req, res)=>{
  res.render("aboutus.ejs")
});
app.get("/privacy", async(req, res)=>{
  res.render("privacy.ejs")
});
app.get("/terms", async(req, res)=>{
  res.render("terms.ejs")
});
app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);
app.use("/", user);
app.use("/", bookingRoutes);

app.all("*", (req, res, next)=>{
    next(new ExpressError(404, "Page not Found!"));
});

app.use((err, req, res, next)=>{
    let { statusCode = 500, message = "Something went wrong!"} = err;
    res.status(statusCode).render("error.ejs",{message});
});


app.listen(8080, ()=>{
    console.log("listening to port 8080.");
});