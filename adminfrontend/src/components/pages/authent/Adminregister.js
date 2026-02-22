import React, { useState, useEffect } from "react";
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, User, ShieldCheck, Lock, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const AdminRegister = () => {
  useEffect(() => {
    document.title = "Complexe Médicale";
  }, []);
  const [formData, setFormData] = useState({ username: '', cin: '', password: '' });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/Admin/Register', formData);
      alert("Inscription réussie !");
      navigate('/admin/login');
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'inscription");
    }
  };

  return (
    <div className="login-container"> {/* Réutilisation du CSS de login */}
      <div className="login-card">
        <div className="login-header">
          <div className="logo-circle" style={{ backgroundColor: '#dcfce7' }}>
            <UserPlus size={30} className="text-green-600" />
          </div>
          <h1>Nouvel Admin</h1>
          <p>Créez un compte administrateur</p>
        </div>

        <form onSubmit={handleRegister} className="login-form">
          <div className="input-group">
            <User className="input-icon" size={20} />
            <input 
              type="text" placeholder="Nom d'utilisateur" 
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required 
            />
          </div>

          <div className="input-group">
            <ShieldCheck className="input-icon" size={20} />
            <input 
              type="text" placeholder="Numéro CIN" 
              onChange={(e) => setFormData({...formData, cin: e.target.value})}
              required 
            />
          </div>

          <div className="input-group">
            <Lock className="input-icon" size={20} />
            <input 
              type="password" placeholder="Mot de passe" 
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required 
            />
          </div>

          <button type="submit" className="login-button" style={{ backgroundColor: '#10b981' }}>
            Créer le compte
          </button>
        </form>

        <div style={{ marginTop: '1.5rem' }}>
          <Link to="/admin/login" className="flex items-center justify-center text-sm text-gray-500 hover:text-blue-600">
            <ArrowLeft size={14} className="mr-1" /> Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;