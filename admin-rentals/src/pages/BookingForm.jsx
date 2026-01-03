// src/pages/BookingForm.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
import Loader from "../components/Loader";
import {
  CountrySelect,
  StateSelect,
  CitySelect,
} from "react-country-state-city";
import "react-country-state-city/dist/react-country-state-city.css";

function BookingForm() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookingData, setBookingData] = useState({
    car: "",
    user: "",
    userName: "",
    userEmail: "",
    startDate: "",
    endDate: "",
    from: "",
    to: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Location state for "from" and "to"
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [fromState, setFromState] = useState(null);
  const [fromCity, setFromCity] = useState(null);
  const [toState, setToState] = useState(null);
  const [toCity, setToCity] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [carsResponse, usersResponse] = await Promise.all([
          fetch("http://localhost:5007/api/cars/for-booking", { credentials: "include" }),
          fetch("http://localhost:5007/api/users/for-booking",{ credentials: "include" }),
        ]);

        if (!carsResponse.ok) throw new Error("Failed to fetch cars");
        if (!usersResponse.ok) throw new Error("Failed to fetch users");

        const carsData = await carsResponse.json();
        const usersData = await usersResponse.json();

        setCars(Array.isArray(carsData.cars) ? carsData.cars : carsData);
        setUsers(Array.isArray(usersData.users) ? usersData.users : usersData);

        if (bookingId) {
          const bookingRes = await fetch(
            `http://localhost:5007/api/bookings/${bookingId}`
          );
          if (!bookingRes.ok) throw new Error("Failed to fetch booking");
          const booking = await bookingRes.json();
          setBookingData({
            car: booking.vehicle?._id || "",
            user: booking.user?._id || "",
            userName: booking.user?.name || "",
            userEmail: booking.user?.email || "",
            startDate: booking.startDate,
            endDate: booking.endDate,
            from: booking.from,
            to: booking.to,
          });
          // Optionally, parse booking.from/to to pre-populate dropdowns.
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [bookingId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({ ...prev, [name]: value }));
  };

  // Combine location selections into a single string before submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fromLocation =
      fromCity && fromState && selectedCountry
        ? `${fromCity.name}, ${fromState.name}, ${selectedCountry.name}`
        : bookingData.from;
    const toLocation =
      toCity && toState && selectedCountry
        ? `${toCity.name}, ${toState.name}, ${selectedCountry.name}`
        : bookingData.to;

    const submissionData = {
      user: bookingData.user,
      vehicle: bookingData.car,
      startDate: bookingData.startDate,
      endDate: bookingData.endDate,
      from: fromLocation,
      to: toLocation,
    };

    const endpoint = bookingId
      ? `http://localhost:5007/api/bookings/update/${bookingId}`
      : "http://localhost:5007/api/bookings/admin-booking";

    try {
      const res = await fetch(endpoint, {
        method: bookingId ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });
      if (!res.ok) {
        const errMsg = await res.text();
        throw new Error(errMsg);
      }
      navigate("/bookings");
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <>
      <AdminNavbar />
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">
          {bookingId ? "Update Booking" : "New Booking"}
        </h1>
        {error && <div className="alert alert-error mb-4">{error}</div>}
        {loading ? (
          <Loader />
        ) : (
          <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4">
            <div>
              <label className="block mb-1">Select Car</label>
              <select
                name="car"
                value={bookingData.car}
                onChange={handleChange}
                className="select select-bordered w-full"
                required
              >
                <option value="">Select Car</option>
                {cars.map((car) => (
                  <option key={car._id} value={car._id}>
                    {car.name} ({car.model})
                  </option>
                ))}
              </select>
            </div>
            <div>
              {bookingId ? (
                <>
                  <label className="block mb-1">User</label>
                  <div className="p-2 border rounded">
                    {bookingData.userName} ({bookingData.userEmail})
                  </div>
                </>
              ) : (
                <>
                  <label className="block mb-1">Select User</label>
                  <select
                    name="user"
                    value={bookingData.user}
                    onChange={handleChange}
                    className="select select-bordered w-full"
                    required
                  >
                    <option value="">Select User</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>
            <div>
              <label className="block mb-1">Journey Start Date</label>
              <input
                type="date"
                name="startDate"
                value={
                  bookingData.startDate
                    ? bookingData.startDate.substring(0, 10)
                    : ""
                }
                onChange={handleChange}
                className="input input-bordered w-full"
                required
                min={todayStr}
              />
            </div>
            <div>
              <label className="block mb-1">Journey End Date</label>
              <input
                type="date"
                name="endDate"
                value={
                  bookingData.endDate
                    ? bookingData.endDate.substring(0, 10)
                    : ""
                }
                onChange={handleChange}
                className="input input-bordered w-full"
                required
                min={
                  bookingData.startDate
                    ? bookingData.startDate.substring(0, 10)
                    : todayStr
                }
              />
            </div>
            {/* Location Selection */}
            <div>
              <h6 className="mb-1">Select Country</h6>
              <CountrySelect
                containerClassName="form-group"
                inputClassName="input input-bordered w-full"
                onChange={setSelectedCountry}
                placeHolder="Select Country"
              />
            </div>
            <div>
              <h6 className="mb-1">Select From State</h6>
              <StateSelect
                countryid={selectedCountry?.id}
                containerClassName="form-group"
                inputClassName="input input-bordered w-full"
                onChange={setFromState}
                placeHolder="Select State"
              />
            </div>
            <div>
              <h6 className="mb-1">Select From City</h6>
              <CitySelect
                countryid={selectedCountry?.id}
                stateid={fromState?.id}
                containerClassName="form-group"
                inputClassName="input input-bordered w-full"
                onChange={setFromCity}
                placeHolder="Select City"
              />
            </div>
            <div>
              <h6 className="mb-1">Select To State</h6>
              <StateSelect
                countryid={selectedCountry?.id}
                containerClassName="form-group"
                inputClassName="input input-bordered w-full"
                onChange={setToState}
                placeHolder="Select State"
              />
            </div>
            <div>
              <h6 className="mb-1">Select To City</h6>
              <CitySelect
                countryid={selectedCountry?.id}
                stateid={toState?.id}
                containerClassName="form-group"
                inputClassName="input input-bordered w-full"
                onChange={setToCity}
                placeHolder="Select City"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : bookingId
                ? "Update Booking"
                : "Create Booking"}
            </button>
          </form>
        )}
      </div>
    </>
  );
}

export default BookingForm;
