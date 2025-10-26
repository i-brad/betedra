import mongoose, { Document, Schema } from "mongoose";

interface ILeaderboard extends Document {
  address: string;
  winnings: number;
  winningsInUsd: number;
  total_rounds_won: number;
  total_rounds_played: number;
}

const LeaderboardSchema: Schema = new Schema(
  {
    address: { type: String, required: true, unique: true, lowercase: true },
    winnings: { type: Number, default: 0 },
    winningsInUsd: { type: Number, default: 0 },
    total_rounds_won: { type: Number, default: 0 },
    total_rounds_played: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Leaderboard ||
  mongoose.model<ILeaderboard>("Leaderboard", LeaderboardSchema);
