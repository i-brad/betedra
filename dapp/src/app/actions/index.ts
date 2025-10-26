"use server";

import mongoose from "mongoose";
const mongoURI = process.env.mongodbURI as string;

export const connectToDatabase = async () => await mongoose.connect(mongoURI);
