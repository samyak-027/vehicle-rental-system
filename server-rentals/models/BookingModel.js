import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },

    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cars",
      required: true,
    },

    from: {
      type: String,
      required: true,
    },

    to: {
      type: String,
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    totalPrice: {
      type: Number,
      required: true,
    },

    advancePaid: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"],
      default: "UPCOMING",
    },

    bookingDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Bookings", bookingSchema);


// // models/BookingModel.js
// import mongoose from "mongoose";

// const bookingSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
//   car: { type: mongoose.Schema.Types.ObjectId, ref: "Cars", required: true },
//   startDate: { type: Date, required: true },
//   endDate: { type: Date, required: true },
//   from: { type: String, required: true },
//   to: { type: String, required: true },
//   totalCost: { type: Number, required: true },
//   status: { type: String, default: "active" },
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now },
// });

// // This pre-save hook will update updatedAt on document save.
// bookingSchema.pre("save", function (next) {
//   this.updatedAt = Date.now();
//   next();
// });

// const Booking = mongoose.models.Bookings || mongoose.model("Bookings", bookingSchema);
// export default Booking;