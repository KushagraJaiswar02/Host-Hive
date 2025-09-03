const Review = require("../models/review");
const Listing = require("../models/listing");
const User = require("../models/user"); 


module.exports.postReview = async (req, res) => {
  let listing = await Listing.findById(req.params.id);

  let newreview = new Review(req.body.review);
  newreview.author = req.user._id;
  newreview.listing = listing._id;

  // Save review first
  await newreview.save();

  // Push into listing and save without validating whole schema
  listing.reviews.push(newreview._id);
  await listing.save({ validateBeforeSave: false });

  // Push into user profile
  const user = await User.findById(req.user._id);
  user.reviews.push(newreview._id);
  await user.save();

  console.log("new review saved");
  req.flash("success", "New Review Added!");
  res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async (req, res) => {
    let { id, reviewId } = req.params;

    // remove review reference from listing
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    // remove review reference from user
    await User.findByIdAndUpdate(req.user._id, { $pull: { reviews: reviewId } });

    // actually delete the review
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review was deleted!");
    res.redirect(`/listings/${id}`);
};
