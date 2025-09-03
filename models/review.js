const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    comment: String,
    rating: {
        type: Number,
        min: 1,
        max: 5, // fixed typo
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    listing: {  // <- add this
        type: Schema.Types.ObjectId,
        ref: "Listing"
    }
});

module.exports = mongoose.model("Review", reviewSchema);
