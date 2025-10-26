import mongoose from "mongoose";

const mongoURI = process.env.mongodbURI as string;
const ADMIN_API_KEY = process.env.ADMIN_API_KEY!;

const connectToDatabase = () => mongoose.connect(mongoURI, {});
// .then(() => console.log("Connected to MongoDB"))
// .catch((err) => console.error("Failed to connect to MongoDB:", err));

const disconnectFromDatabase = async () => {
  if (
    mongoose.connection.readyState !== 0 &&
    process.env.NODE_ENV !== "production"
  ) {
    await mongoose
      .disconnect()
      .catch((err) => console.error("Failed to disconnect from MongoDB:", err));
  }
};

function authenticateAdmin(request: any) {
  const apiKey = request.headers.get("x-api-key");

  if (!apiKey || apiKey !== ADMIN_API_KEY) {
    throw new Error("Unauthorized access");
  }
}

export { authenticateAdmin, connectToDatabase, disconnectFromDatabase };
