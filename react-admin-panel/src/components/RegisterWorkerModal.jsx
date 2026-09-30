import { useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\-\s()]{7,15}$/;

export default function RegisterWorkerModal({ token, onClose, onSave }) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  function validate() {
    const next = {};
    if (!fullName.trim()) next.fullName = "Full name is required.";
    if (!phone.trim()) next.phone = "Number is required.";
    else if (!PHONE_RE.test(phone.trim())) next.phone = "Enter a valid number.";
    if (!email.trim()) next.email = "Email is required.";
    else if (!EMAIL_RE.test(email.trim())) next.email = "Enter a valid email.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError("");

    try {
      const response = await fetch("/api/admin/add-worker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
        }),
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || `Server error (${response.status})`);
      }

      if (!response.ok) {
        throw new Error(data.msg || data.error || "Failed to register worker");
      }

      onSave(data.worker || { name: fullName.trim(), phone: phone.trim(), email: email.trim() });
    } catch (err) {
      console.error("Register worker error:", err);
      setApiError(err.message || "Failed to submit request to server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <form className="modal" onSubmit={handleSubmit}>
        <h2 className="modal-title">Register worker</h2>
        <p className="modal-sub">They'll use these details to log in on the AssetTag app.</p>

        {apiError && <div className="field-error" style={{ marginBottom: 16 }}>{apiError}</div>}

        <div className="field">
          <label htmlFor="fullName">Full name</label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={loading}
            autoFocus
          />
          {errors.fullName && <div className="field-error">{errors.fullName}</div>}
        </div>

        <div className="field">
          <label htmlFor="phone">Number</label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={loading}
          />
          {errors.phone && <div className="field-error">{errors.phone}</div>}
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          {errors.email && <div className="field-error">{errors.email}</div>}
        </div>

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
            {loading ? "Registering..." : "Register"}
          </button>
        </div>
      </form>
    </div>
  );
}
