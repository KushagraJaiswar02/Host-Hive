const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken : mapToken });
const User = require("../models/user"); 
const Booking = require("../models/booking");


module.exports.index = async (req, res) => {
  const allListings = await Listing.find({}).populate('reviews');

  const listingsWithRatings = allListings.map(listing => {
    let avgRating = null;
    let reviewCount = 0;
    if (listing.reviews && listing.reviews.length > 0) {
      reviewCount = listing.reviews.length;
      const total = listing.reviews.reduce((sum, r) => sum + r.rating, 0);
      avgRating = (total / reviewCount).toFixed(1);
    }
    return { ...listing._doc, avgRating, reviewCount };
  });

  res.render("index.ejs", { allListings: listingsWithRatings });
};


module.exports.newRoute = (req, res)=>{
    res.render("new.ejs");
};

module.exports.createRoute = async (req, res) => {
  // 1. Geocode based on location string (from form)
  const geoData = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location, // form field: listing[location]
      limit: 1
    })
    .send();

  // 2. Create new listing
  const newListing = new Listing(req.body.listing);

  // 3. Add geometry from geocode
  if (geoData.body.features.length > 0) {
    newListing.geometry = geoData.body.features[0].geometry;
  } else {
    // fallback if no geocode found
    newListing.geometry = {
      type: "Point",
      coordinates: [0, 0]
    };
  }

  // 4. Add image if uploaded
  if (req.file) {
    newListing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  // 5. Add owner
  newListing.owner = req.user._id;

  // 6. Save to DB
  await newListing.save();

  req.flash("success", "New listing created!");
  res.redirect(`/listings/${newListing._id}`);
};

module.exports.showRoute = async (req, res)=>{
    
    let { id }= req.params;
    const listing = await Listing.findById(id)
    .populate({
        path : "reviews",
    populate : {
        path : "author",
    },
    })
    .populate("owner");
    if(!listing){
        req.flash("error", "Requested listing doesnot exist!");
        return res.redirect("/listings");
    }
    // console.log(listing);
    res.render("show.ejs", { listing });
};

module.exports.filterRoute = async (req, res) => {
  const { category } = req.params;

  // Fetch listings and populate reviews
  const listings = await Listing.find({ category }).populate('reviews');

  const listingsWithRatings = listings.map(listing => {
    let avgRating = null;
    let reviewCount = 0;
    if (listing.reviews && listing.reviews.length > 0) {
      reviewCount = listing.reviews.length;
      const total = listing.reviews.reduce((sum, r) => sum + r.rating, 0);
      avgRating = (total / reviewCount).toFixed(1);
    }
    return { ...listing._doc, avgRating, reviewCount };
  });

  res.render("filtered.ejs", { listings: listingsWithRatings, category });
};


module.exports.editRoute = async (req, res)=>{
   let { id } = req.params;
   const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Requested listing doesnot exist!");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250,c_fit");
    console.log(originalImageUrl);
   res.render("edit.ejs", { listing, originalImageUrl });
};

module.exports.updateRoute = async (req, res)=>{
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

    if(typeof req.file !== "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url, filename};
    await listing.save();
    }
    req.flash("success", "Listing was Updated!");
    res.redirect(`/listings/${id}`);
}

module.exports.deleteRoute = async (req, res)=>{
    let{ id } = req.params;
    let deletelist = await Listing.findByIdAndDelete(id);
    console.log(deletelist);
    req.flash("success", "Listing was Deleted!");
    res.redirect("/listings");
}

module.exports.searchRoute = async (req, res) => {
  const { q, country } = req.query;
  let filter = {};
  if(q) filter.title = { $regex: q, $options: 'i' }; // case-insensitive search
  if(country) filter.country = country;

  const listings = await Listing.find(filter);
  res.render("filtered.ejs", { listings, category: 'Search Results' });
};



