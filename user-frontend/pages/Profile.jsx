import React, { useEffect, useState } from "react";
import { useStore } from "../context/store.jsx";
import * as api from "../services/api.js";
import { Upload, Check, Clock, XCircle, User } from "lucide-react";

export const Profile = () => {
  const { state, dispatch } = useStore();
  const [bookings, setBookings] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);

  const user = state.auth.user;

  /* =======================
     FETCH USER BOOKINGS
  ======================= */
  useEffect(() => {
    if (user) fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    try {
      const res = await api.getMyBookings();
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error("Failed to fetch bookings", err);
    }
  };

  /* =======================
     LICENSE UPLOAD
  ======================= */
  const handleUpload = async () => {
    if (!frontFile || !backFile) {
      alert("Please upload both license images");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("licenseFront", frontFile);
      formData.append("licenseBack", backFile);

      await api.uploadLicense(formData);

      dispatch({
        type: "UPDATE_USER",
        payload: {
          ...user,
          licenseStatus: "PENDING",
        },
      });

      alert("License uploaded successfully. Await admin approval.");
    } catch (err) {
      console.error(err);
      alert("License upload failed");
    } finally {
      setUploading(false);
    }
  };

  /* =======================
     STATUS BADGE
  ======================= */
  const renderStatus = () => {
    switch (user.licenseStatus) {
      case "APPROVED":
        return (
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded flex items-center gap-1 text-sm">
            <Check size={14} /> Verified
          </span>
        );
      case "PENDING":
        return (
          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded flex items-center gap-1 text-sm">
            <Clock size={14} /> Pending
          </span>
        );
      case "REJECTED":
        return (
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded flex items-center gap-1 text-sm">
            <XCircle size={14} /> Rejected
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-sm">
            Not Uploaded
          </span>
        );
    }
  };

  if (!user)
    return <div className="p-10 text-center">Please login</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* LEFT PANEL */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm text-center">
            <div className="w-24 h-24 bg-slate-200 rounded-full mx-auto mb-3 flex items-center justify-center">
              <User size={40} className="text-slate-400" />
            </div>

            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>

            <div className="mt-4 flex justify-center">
              {renderStatus()}
            </div>
          </div>

          {/* LICENSE UPLOAD */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="font-bold mb-4">License Verification</h3>

            {user.licenseStatus === "APPROVED" ? (
              <p className="text-green-600 text-sm">
                Your license has been verified.
              </p>
            ) : (
              <>
                <input
                  type="file"
                  onChange={(e) => setFrontFile(e.target.files[0])}
                  className="w-full mb-3"
                />
                <input
                  type="file"
                  onChange={(e) => setBackFile(e.target.files[0])}
                  className="w-full mb-4"
                />

                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full bg-primary text-white py-2 rounded hover:bg-sky-600 disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Upload License"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold mb-6">My Bookings</h2>

          {bookings.length === 0 ? (
            <div className="bg-white p-6 rounded-lg border text-center">
              No bookings yet.
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => (
                <div
                  key={b._id}
                  className="bg-white p-4 rounded-lg border shadow-sm flex items-center gap-4"
                >
                  <img
                    src={b.vehicle?.image || '/placeholder-car.jpg'}
                    alt={b.vehicle?.name || 'Vehicle'}
                    className="w-24 h-16 rounded object-cover"
                  />

                  <div className="flex-grow">
                    <h4 className="font-bold">{b.vehicle?.name || 'Vehicle'}</h4>
                    <p className="text-sm text-gray-500">
                      {new Date(b.startDate).toDateString()} →{" "}
                      {new Date(b.endDate).toDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {b.from} → {b.to}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold">₹{b.totalPrice}</p>
                    <p className="text-xs text-gray-500">Paid: ₹{b.advancePaid}</p>
                    <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Profile;