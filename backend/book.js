import mongoose from "mongoose";
const BookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },

    author: {
        type: String,
        required: true,
        trim: true
    },

    category: {
        type: String,
        trim: true
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },


    rating: {
        type: Number,
        default: 0

    },

    wishlistBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],

    isRead: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});
const Book = mongoose.model("Book", BookSchema);
export default Book;