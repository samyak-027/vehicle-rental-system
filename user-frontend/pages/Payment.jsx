import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useStore } from "../context/store.jsx";
import * as api from "../services/api.js";

export const Payment = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useStore();
  const location = useLocation();

  const [loading, setLoading] = useState(false);

  const { amount, bookingData } = location.state || {};

  if (!bookingData) {
    return (
      <div className="p-10 text-center">
        Invalid booking request.
      </div>
    );
  }

  const handlePayment = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // 🔐 Send booking to backend
      await api.createBooking({
        vehicleId: bookingData.vehicleId,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        from: bookingData.from,
        to: bookingData.to,
      });

      // Clear booking data
      dispatch({ type: "CLEAR_BOOKING" });

      alert("Payment successful! Booking confirmed.");
      navigate("/profile");
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md">

        <h2 className="text-2xl font-bold text-center mb-2">
          Secure Payment
        </h2>

        <p className="text-center text-slate-600 mb-6">
          Pay <strong>₹{amount}</strong> to confirm your booking
        </p>

        <form onSubmit={handlePayment} className="space-y-4">

          <input
            required
            placeholder="Card Number"
            className="w-full border px-3 py-2 rounded"
          />

          <div className="flex gap-4">
            <input
              required
              placeholder="MM/YY"
              className="w-1/2 border px-3 py-2 rounded"
            />
            <input
              required
              placeholder="CVC"
              className="w-1/2 border px-3 py-2 rounded"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded hover:bg-sky-600 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Pay & Confirm Booking"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Payment;
