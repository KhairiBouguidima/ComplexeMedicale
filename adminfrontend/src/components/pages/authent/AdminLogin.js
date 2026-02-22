import React, { useState, useEffect } from "react";
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, ArrowRight } from 'lucide-react';
import axios from 'axios';

const AdminLogin = () => {
  useEffect(() => {
    document.title = "Complexe Médicale";
  }, []);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // On envoie 'email' ou 'username' selon ce que votre route /Admin/Login attend
      const res = await axios.post('http://localhost:5000/Admin/Login', { 
        username: username, // Si votre backend cherche "email" dans data.get("email")
        password: password 
      });
      localStorage.setItem('token', res.data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || "Identifiants invalides");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-circle">
            <Lock size={30} className="text-blue-600" />
          </div>
          <h1>Espace Admin</h1>
          <p>Authentification requise</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <User className="input-icon" size={20} />
            <input 
              type="text" 
              placeholder="Nom d'utilisateur" 
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>

          <div className="input-group">
            <Lock className="input-icon" size={20} />
            <input 
              type="password" 
              placeholder="Mot de passe" 
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="login-button">
            Se connecter <ArrowRight size={18} />
          </button>
        </form>
        
        <div className="footer-link">
          <p>Pas encore de compte ? <Link to="/admin/register">S'inscrire</Link></p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;