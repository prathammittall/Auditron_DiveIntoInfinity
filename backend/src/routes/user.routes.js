import { Router } from "express";
import { pdfUpload } from "../controllers/pdf.controller.js";
import  upload from '../middlewares/multer.middleware.js'

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "pdf",
            maxCount: 1,
        }
])
, pdfUpload)


export default router