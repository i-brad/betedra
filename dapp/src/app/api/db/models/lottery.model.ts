import mongoose, { Document, Schema } from "mongoose";

interface ILottery extends Document {
  address: string;
  lotteries: number[];
}

const LotterySchema: Schema = new Schema<ILottery>(
  {
    address: { type: String, required: true, unique: true, lowercase: true },
    lotteries: {
      type: [Number],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Lottery ||
  mongoose.model<ILottery>("Lottery", LotterySchema);
