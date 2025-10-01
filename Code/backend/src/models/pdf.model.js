import mongoose from "mongoose";

const pdf = mongoose.Schema({
    email: {
        type: String,
    },
    pdf: {
        type: String,
        required: true
    }
})

export const Pdf = mongoose.model("Pdf", pdf)