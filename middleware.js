const Listing = require("./models/listing");
const Review = require("./models/review");
const {listingSchema, reviewSchema} = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");

module.exports.isLoggedIn = (req, res, next) =>{
    if(!req.isAuthenticated()) {
        console.log(req.path, "..", req.originalUrl);
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to create!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) =>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    };
    next();
};

module.exports.isOwner = async (req, res, next) =>{
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.CurrUser._id)){
        req.flash("error", "Permissions required to make changes.");
        return res.redirect(`/listings/${id}`);
    }

    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
    let { reviewId, id } = req.params;
    let review = await Review.findById(reviewId);

    if(!review) {
        req.flash("error", "Review not found!");
        return res.redirect(`/listings/${id}`);
    }

    if(!review.author.equals(res.locals.CurrUser._id)){
        req.flash("error", "You are not the author!");
        return res.redirect(`/listings/${id}`);
    }

    next();
}


module.exports.validateListing = (req, res, next)=>{
    let { error } = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>  el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else{
        next();
    }
};

module.exports.validateReview = (req, res, next)=>{
    let { error } = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>  el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else{
        next();
    }
};