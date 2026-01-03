// src/pages/Users.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
import Loader from "../components/Loader";
import axios from "axios";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null); // To handle button loading states
  const navigate = useNavigate();

  const fetchUsers = () => {
    setLoading(true);
    fetch("http://localhost:5007/api/users/getAllusers", { credentials: "include" })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((data) => {
        if (data.success && Array.isArray(data.users)) {
          setUsers(data.users);
        } else {
          console.error("Expected array of users but got:", data);
          setUsers([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        setUsers([]);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const viewJourneys = (userId) => {
    navigate(`/user-history/${userId}`);
  };

  const handleVerify = async (userId) => {
    if (!window.confirm("Are you sure you want to VERIFY this user?")) return;
    setProcessing(userId);

    try {
      const res = await axios.patch(
        `http://localhost:5007/api/users/verify-license/${userId}`,
        {},
        { withCredentials: true }
      );
      if (res.data.success) {
        alert("User verified successfully!");
        fetchUsers();
      }
    } catch (err) {
      alert("Verification failed.");
      console.error(err);
    }
    setProcessing(null);
  };

  const handleReject = async (userId) => {
    if (!window.confirm("Are you sure you want to REJECT this user's license?")) return;
    setProcessing(userId);

    try {
      const res = await axios.patch(
        `http://localhost:5007/api/users/reject-license/${userId}`,
        {},
        { withCredentials: true }
      );
      if (res.data.success) {
        alert("License rejected.");
        fetchUsers();
      }
    } catch (err) {
      alert("Rejection failed.");
      console.error(err);
    }
    setProcessing(null);
  };

  return (
    <>
      <AdminNavbar />
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">All Users</h1>
        {loading ? (
          <Loader />
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>License Status</th>
                  <th>License Images</th>
                  <th>Actions</th>
                  <th>Journeys</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.licenseStatus || "NOT_UPLOADED"}</td>
                    <td>
                      {(user.licenseFront || user.licenseFrontUrl) && (user.licenseBack || user.licenseBackUrl) ? (
                        <div className="flex gap-2">
                          <a href={user.licenseFront || user.licenseFrontUrl} target="_blank" rel="noopener noreferrer">
                            <img
                              src={user.licenseFront || user.licenseFrontUrl}
                              alt="Front"
                              className="w-12 h-12 object-cover border rounded"
                            />
                          </a>
                          <a href={user.licenseBack || user.licenseBackUrl} target="_blank" rel="noopener noreferrer">
                            <img
                              src={user.licenseBack || user.licenseBackUrl}
                              alt="Back"
                              className="w-12 h-12 object-cover border rounded"
                            />
                          </a>
                        </div>
                      ) : (
                        <span>No uploads</span>
                      )}
                    </td>
                    <td>
                      {(user.licenseStatus === "PENDING" || (!user.licenseStatus && !user.isAccountVerified)) &&
                        (user.licenseFront || user.licenseFrontUrl) &&
                        (user.licenseBack || user.licenseBackUrl) && (
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => handleVerify(user._id)}
                              className="btn btn-xs btn-success"
                              disabled={processing === user._id}
                            >
                              {processing === user._id ? "Verifying..." : "✅ Verify"}
                            </button>
                            <button
                              onClick={() => handleReject(user._id)}
                              className="btn btn-xs btn-error"
                              disabled={processing === user._id}
                            >
                              {processing === user._id ? "Rejecting..." : "❌ Reject"}
                            </button>
                          </div>
                        )}
                      {(user.licenseStatus === "APPROVED" || user.isAccountVerified) && (
                        <span className="badge badge-success">Approved</span>
                      )}
                      {user.licenseStatus === "REJECTED" && (
                        <span className="badge badge-error">Rejected</span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => viewJourneys(user._id)}
                        className="btn btn-sm btn-primary"
                      >
                        View Journeys
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default Users;