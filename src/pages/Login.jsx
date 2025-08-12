import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './Login.css';

const Login = () => {
  const [waId, setWaId] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    console.log(storedUser);
    
    if (storedUser) {
      navigate("/home");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("https://whatsapp-backend-6aup.onrender.com/api/auth/login", {
        wa_id: waId,
        name,
      });

      const user = response.data;
      sessionStorage.setItem(
        "user",
        JSON.stringify({ _id: user._id, wa_id: user.wa_id, name: user.name })
      );

      navigate("/home");
    } catch (err) {
      setError(
        err.response?.data?.error || "Login failed, please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login to WhatsApp</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="WhatsApp ID (e.g. phone number)"
          value={waId}
          onChange={(e) => setWaId(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default Login;
