import { useEffect, useState } from "react";
import RegisterWorkerModal from "./RegisterWorkerModal";

export default function Dashboard({ token, onLogout }) {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/workers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        onLogout();
        return;
      }

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || `Server error (${response.status})`);
      }

      if (Array.isArray(data)) {
        setWorkers(data);
      }
    } catch (err) {
      console.error("Failed to fetch workers:", err);
      setToast("Failed to load workers from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [token]);

  function handleSaveWorker(worker) {
    setShowModal(false);
    setToast(`Worker "${worker.name}" registered successfully.`);
    fetchWorkers();
  }

  async function handleDeleteWorker(id, name) {
    if (!window.confirm(`Are you sure you want to delete worker "${name}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/admin/worker/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        onLogout();
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.msg || "Failed to delete worker");
      }

      setToast(`Worker "${name}" deleted.`);
      fetchWorkers();
    } catch (err) {
      console.error("Delete worker error:", err);
      setToast(err.message || "Failed to delete worker");
    } finally {
      setDeletingId(null);
    }
  }

  const getInitials = (name) => {
    if (!name) return "W";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const filteredWorkers = workers.filter((w) => {
    const term = searchTerm.toLowerCase();
    return (
      (w.name && w.name.toLowerCase().includes(term)) ||
      (w.email && w.email.toLowerCase().includes(term)) ||
      (w.phone && w.phone.toLowerCase().includes(term))
    );
  });

  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="brand">
          <div className="brand-mark" />
          <span className="brand-name">AssetTag</span>
          <span className="brand-sub">Admin Portal</span>
        </div>
        <button className="logout-link" onClick={onLogout}>
          Log out
        </button>
      </div>

      <div className="main">
        <div className="main-header">
          <div>
            <h1 className="main-title">
              Registered Workers
              <span className="badge">{workers.length}</span>
            </h1>
          </div>
          <button className="register-btn" onClick={() => setShowModal(true)}>
            + Register worker
          </button>
        </div>

        {workers.length > 0 && (
          <div className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}

        {loading ? (
          <div className="loading-state">Loading registered workers...</div>
        ) : filteredWorkers.length > 0 ? (
          <div className="worker-table-container">
            <table className="worker-table">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Contact Info</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkers.map((w) => (
                  <tr key={w._id}>
                    <td>
                      <div className="worker-info">
                        <div className="avatar">{getInitials(w.name)}</div>
                        <div>
                          <div className="worker-name">{w.name}</div>
                          <div className="worker-email">{w.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="worker-phone">{w.phone}</div>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn-icon-danger"
                        disabled={deletingId === w._id}
                        onClick={() => handleDeleteWorker(w._id, w.name)}
                      >
                        {deletingId === w._id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <h3>{searchTerm ? "No matching workers found" : "No workers registered yet"}</h3>
            <p>
              {searchTerm
                ? "Try adjusting your search criteria."
                : "Click the 'Register worker' button above to add your first worker profile."}
            </p>
          </div>
        )}
      </div>

      {showModal && (
        <RegisterWorkerModal
          token={token}
          onClose={() => setShowModal(false)}
          onSave={handleSaveWorker}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
