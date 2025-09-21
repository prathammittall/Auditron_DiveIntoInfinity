import { Pdf } from "../models/pdf.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const pdfUpload = asyncHandler(async (req, res) => {
    const { email } = req.body

    const pdfLocalPath = req?.files?.pdf?.[0]?.path;

    if (!pdfLocalPath) {
        return res
        .status(404)
        .json({status: 404, message: "pdf is required"})
    }

    const pdf = await uploadOnCloudinary(pdfLocalPath)

    if (!pdf) {
        return res.status(500)
        .json({status: 500, message: "Something went wrong while uploading the pdf"})
    }

    const pdfUpload = await Pdf.create({
        email,
        pdf: pdf.url,
    })

    return res
    .status(201)
    .json({
        status: 201, 
        message: "User registered successfully!!", 
        pdf_url: pdf.url,
        user: {
            email,
            avatar: pdf.url
        }
    })
})

