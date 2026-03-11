import express from "express"
import {  generateVideoFromImage } from "../controller/Image_Generate_video.js";

const ImageRouter = express.Router();

ImageRouter.post("/Image",generateVideoFromImage);

export default ImageRouter
