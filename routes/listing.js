const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});

router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(isLoggedIn,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(listingController.createRoute));

//New route
router.get("/new",isLoggedIn,listingController.newRoute);
  
//Filtered Route
router.get("/category/:category",listingController.filterRoute);


// search
router.get("/search", wrapAsync(listingController.searchRoute));

router
  .route("/:id")
  .get(wrapAsync(listingController.showRoute))
  .put(isLoggedIn,isOwner,upload.single('listing[image]'),validateListing,wrapAsync(listingController.updateRoute))
  .delete(isLoggedIn,isOwner,wrapAsync(listingController.deleteRoute));
  
//Edit route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.editRoute));


module.exports = router;