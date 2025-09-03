const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { route } = require("./listing");
const passport = require("passport");
const { saveRedirectUrl, isLoggedIn, validateListing } = require("../middleware.js");
const userController = require("../controllers/users.js");

router
  .route("/signup")
  .get(userController.renderSignup)
  .post(wrapAsync(userController.userSignup));
   
router
  .route("/login")
  .get(userController.userLoginrender)
  .post(saveRedirectUrl,
    passport.authenticate("local",{
    failureRedirect : "/login",
    failureFlash : true,
    }) , userController.userLogin);

router.get("/user/dashboard", isLoggedIn, async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId)
    .populate("listings")
    .populate({
      path: "reviews",
      populate: { path: "listing", select: "title _id" } // populate the listing for each review
    })
    .populate({
      path: "bookings",
      populate: { path: "listing" } // so booking shows its listing details
    });

  res.render("users/userdash.ejs", { user });
});



router.get("/logout", userController.userLogout);

module.exports = router;
