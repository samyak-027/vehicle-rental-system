import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/store.jsx';
import { LicenseStatus } from '../types.js';
import { AlertCircle, CheckCircle } from 'lucide-react';

export const BookingSummary = () => {
  const { state } = useStore();
  const navigate = useNavigate();

  const vehicle = state.selectedVehicle;
  const search = state.searchParams;

  if (!vehicle) {
    return (
      <div className="p-10 text-center">
        No vehicle selected.
        <button
          onClick={() => navigate('/vehicles')}
          className="text-primary underline ml-2"
        >
          Go back
        </button>
      </div>
    );
  }

  // ---------------------------
  // DATE VALIDATION & CALCULATION
  // ---------------------------
  const start = new Date(search.startDate);
  const end = new Date(search.endDate);
  const today = new Date();

  // Validation
  if (start < today) {
    return <div className="p-10 text-center text-red-600">Start date cannot be in the past.</div>;
  }

  const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) {
    return <div className="p-10 text-center text-red-600">Invalid booking duration.</div>;
  }

  if (diffDays > 60) {
    return (
      <div className="p-10 text-center text-red-600">
        Booking allowed only up to 2 months.
      </div>
    );
  }

  const totalAmount = diffDays * vehicle.pricePerDay;
  const advanceAmount = totalAmount * 0.2;

  // ---------------------------
  // HANDLERS
  // ---------------------------
  const handlePayNow = () => {
    if (!state.auth.isAuthenticated) {
      navigate('/login?redirect=/booking/summary');
      return;
    }

    const user = state.auth.user;

    if (!user) return;

    if (user.licenseStatus !== LicenseStatus.APPROVED) {
      navigate('/profile');
      return;
    }

    navigate('/payment', {
      state: {
        amount: advanceAmount,
        bookingData: {
          vehicleId: vehicle._id,
          startDate: search.startDate,
          endDate: search.endDate,
          from: search.fromLocation,
          to: search.toLocation,
        },
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">Booking Summary</h1>

      <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="h-48 md:h-auto">
            <img
              src={vehicle.image}
              alt={vehicle.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-6 col-span-2">
            <h2 className="text-xl font-bold">{vehicle.name}</h2>
            <p className="text-gray-500">{vehicle.location}</p>

            <div className="grid grid-cols-2 gap-4 text-sm mt-4">
              <div>
                <p className="text-gray-400">From</p>
                <p className="font-semibold">{search.fromLocation}</p>
              </div>
              <div>
                <p className="text-gray-400">To</p>
                <p className="font-semibold">{search.toLocation}</p>
              </div>
              <div>
                <p className="text-gray-400">Start</p>
                <p className="font-semibold">{search.startDate}</p>
              </div>
              <div>
                <p className="text-gray-400">Duration</p>
                <p className="font-semibold">{diffDays} Days</p>
              </div>
            </div>
          </div>
        </div>

        {/* PRICE SUMMARY */}
        <div className="bg-slate-50 p-6 border-t">
          <div className="flex justify-between mb-2">
            <span>Total Price</span>
            <span className="font-bold">₹{totalAmount}</span>
          </div>
          <div className="flex justify-between mb-4">
            <span>Pay Now (20%)</span>
            <span className="text-xl font-bold text-primary">
              ₹{advanceAmount}
            </span>
          </div>

          {/* STATUS */}
          {!state.auth.isAuthenticated ? (
            <div className="bg-yellow-50 text-yellow-800 p-4 rounded flex gap-2">
              <AlertCircle />
              <span>Please login to continue.</span>
            </div>
          ) : state.auth.user?.licenseStatus !== LicenseStatus.APPROVED ? (
            <div className="bg-red-50 text-red-800 p-4 rounded flex gap-2">
              <AlertCircle />
              <span>
                License not verified. Please upload documents in profile.
              </span>
            </div>
          ) : (
            <div className="bg-green-50 text-green-800 p-4 rounded flex gap-2">
              <CheckCircle />
              <span>Verified. Ready for payment.</span>
            </div>
          )}

          <button
            onClick={handlePayNow}
            className="mt-4 w-full bg-primary text-white py-3 rounded-lg hover:bg-sky-600"
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;