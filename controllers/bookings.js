const Listing = require("../models/listing");
const User = require("../models/user"); 
const Booking = require("../models/booking");

module.exports.bookingRoute = async (req, res)=>{
    let { listingId } = req.params;
    const listing = await Listing.findById(listingId);
    if(!listing){
        req.flash("error", "Requested listing doesnot exist!");
        return res.redirect("/listings");
    }
    res.render("booking.ejs", { listing });
};

module.exports.bookingCreateRoute = async (req, res) => {
    try {
        const { listingId } = req.params;
        const listing = await Listing.findById(listingId);
        if (!listing) {
            req.flash("error", "Requested listing does not exist!");
            return res.redirect("/listings");
        }

        const { checkIn, checkOut, guests } = req.body;

        // calculate nights
        const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
        if (nights <= 0) {
            req.flash("error", "Invalid date selection!");
            return res.redirect(`/listings/${listingId}/booking`);
        }

        // calculate total price
        const totalPrice = listing.price * nights * guests;

        const booking = new Booking({
         listing: listingId,   
         user: req.user._id,
         checkIn,
         checkOut,
         guests,
         totalPrice
         });


        await booking.save();  

        const user = await User.findById(req.user._id);
        user.bookings.push(booking._id);
        await user.save();

        req.flash("success", "Booking Confirmed!");
        res.redirect(`/listings/${listingId}`);
    } catch (err) {
        console.error(err);
        req.flash("error", "Something went wrong while booking!");
        res.redirect("/listings");
    }
};

module.exports.cancelBookingRoute = async (req, res) => {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking) {
        req.flash("error", "Requested booking does not exist!");
        return res.redirect("/listings");
    }

    await Booking.findByIdAndDelete(bookingId);

    // also clean up from user model (optional, but good practice)
    await User.findByIdAndUpdate(req.user._id, { $pull: { bookings: bookingId } });

    req.flash("success", "Booking was Canceled!");
    res.redirect("/listings");
}

