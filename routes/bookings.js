const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware");
const bookingController = require("../controllers/bookings");


// Booking a listing
router.get("/listings/:listingId/booking", isLoggedIn, wrapAsync(bookingController.bookingRoute));
router.post("/listings/:listingId/booking", isLoggedIn, wrapAsync(bookingController.bookingCreateRoute));
router.post("/listings/:listingId/booking/success", isLoggedIn, wrapAsync(bookingController.bookingSuccessRoute));

// Cancel a booking
router.delete("/:bookingId", isLoggedIn, wrapAsync(bookingController.cancelBookingRoute));


module.exports = router;
