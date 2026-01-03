import Booking from "../models/BookingModel.js";
import Car from "../models/CarModel.js";
import User from "../models/UserModel.js";
import transporter from "../config/nodemailer.js";

/* ===========================
   DATE VALIDATION
=========================== */
const validateBookingDates = (startDate, endDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(startDate);
  const end = new Date(endDate);

  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 2);

  if (start < today) return "Start date cannot be in the past.";
  if (end <= start) return "End date must be after start date.";
  if (end > maxDate) return "Booking allowed only up to 2 months.";

  return null;
};

/* ===========================
   CREATE BOOKING (USER)
=========================== */
export const createBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { vehicleId, startDate, endDate, from, to } = req.body;

    if (!vehicleId || !startDate || !endDate || !from || !to) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const dateError = validateBookingDates(startDate, endDate);
    if (dateError) return res.status(400).json({ message: dateError });

    const car = await Car.findById(vehicleId);
    if (!car || !car.available)
      return res.status(400).json({ message: "Vehicle not available" });

    const overlap = await Booking.findOne({
      vehicle: vehicleId,
      $or: [{ startDate: { $lt: endDate }, endDate: { $gt: startDate } }],
    });

    if (overlap)
      return res.status(400).json({ message: "Vehicle already booked" });

    const days =
      Math.ceil(
        (new Date(endDate) - new Date(startDate)) /
          (1000 * 60 * 60 * 24)
      ) || 1;

    const totalPrice = days * car.pricePerDay;
    const advancePaid = totalPrice * 0.2;

    const booking = await Booking.create({
      user: userId,
      vehicle: vehicleId,
      from,
      to,
      startDate,
      endDate,
      totalPrice,
      advancePaid,
      status: "UPCOMING",
    });

    // Email (non-blocking)
    try {
      const user = await User.findById(userId);
      await transporter.sendMail({
        to: user.email,
        subject: "Booking Confirmed",
        text: `Your booking for ${car.name} is confirmed.\nFrom: ${from}\nTo: ${to}\nAmount: ₹${totalPrice}`,
      });
    } catch (e) {
      console.log("Mail error:", e.message);
    }

    res.status(201).json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===========================
   USER BOOKINGS
=========================== */
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("vehicle")
      .sort({ createdAt: -1 });

    // For old bookings that have 'car' field instead of 'vehicle', populate car data
    const populatedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const bookingObj = booking.toObject();
        
        // If vehicle is not populated but car field exists, fetch car data
        if (!bookingObj.vehicle && bookingObj.car) {
          const carData = await Car.findById(bookingObj.car);
          bookingObj.vehicle = carData;
        }
        
        return bookingObj;
      })
    );

    res.json({ success: true, bookings: populatedBookings });
  } catch (err) {
    console.error("Error fetching user bookings:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ===========================
   ADMIN: ALL BOOKINGS
=========================== */
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate("vehicle")
      .sort({ createdAt: -1 });

    // For old bookings that have 'car' field instead of 'vehicle', populate car data
    const populatedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const bookingObj = booking.toObject();
        
        // If vehicle is not populated but car field exists, fetch car data
        if (!bookingObj.vehicle && bookingObj.car) {
          const carData = await Car.findById(bookingObj.car);
          bookingObj.vehicle = carData;
        }
        
        return bookingObj;
      })
    );

    res.json({ success: true, bookings: populatedBookings });
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ===========================
   UPDATE BOOKING
=========================== */
export const updateBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking)
    return res.status(404).json({ message: "Booking not found" });

  const dateError = validateBookingDates(
    req.body.startDate || booking.startDate,
    req.body.endDate || booking.endDate
  );

  if (dateError) return res.status(400).json({ message: dateError });

  Object.assign(booking, req.body);
  await booking.save();

  res.json({ success: true, booking });
};

/* ===========================
   DELETE BOOKING
=========================== */
export const deleteBooking = async (req, res) => {
  await Booking.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Booking deleted" });
};

/* ===========================
   ADMIN BOOKING
=========================== */
export const adminCreateBooking = async (req, res) => {
  try {
    const { user, vehicle, startDate, endDate, from, to } = req.body;

    if (!user || !vehicle || !startDate || !endDate || !from || !to) {
      return res.status(400).json({ message: "All fields required" });
    }

    const dateError = validateBookingDates(startDate, endDate);
    if (dateError) return res.status(400).json({ message: dateError });

    const car = await Car.findById(vehicle);
    if (!car || !car.available)
      return res.status(400).json({ message: "Vehicle not available" });

    const overlap = await Booking.findOne({
      vehicle,
      $or: [{ startDate: { $lt: endDate }, endDate: { $gt: startDate } }],
    });

    if (overlap)
      return res.status(400).json({ message: "Vehicle already booked" });

    const days =
      Math.ceil(
        (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
      ) || 1;

    const totalPrice = days * car.pricePerDay;

    const booking = await Booking.create({
      user,
      vehicle,
      from,
      to,
      startDate,
      endDate,
      totalPrice,
      advancePaid: 0,
      status: "UPCOMING",
    });

    res.status(201).json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "name email")
      .populate("vehicle");

    if (!booking)
      return res.status(404).json({ message: "Booking not found" });

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
