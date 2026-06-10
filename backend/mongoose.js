import mongoose from "mongoose";
mongoose.connect("mongodb://127.0.0.1:27017/library")
    .then(() => {
        console.log("MONGODB CONNECTED SUCESSFULLY");
    })

    .catch((err) => {
        console.log(err);

    })