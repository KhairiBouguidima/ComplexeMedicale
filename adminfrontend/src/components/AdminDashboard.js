import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Users,
  UserRound,
  Calendar,
  Award,
  Trash2,
  Plus,
  Search,
  Edit,
  FileText,
  DollarSign,
} from "lucide-react";

const AdminDashboard = () => {
  // 1. États mis à jour avec Revenue et Factures
  const [stats, setStats] = useState({
    doctors: 0,
    patients: 0,
    appointments: 0,
    specialities: 0,
    factures: 0,
    totalRevenue: 0,
  });
  const [view, setView] = useState("overview");
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [newSpec, setNewSpec] = useState({ name: "", description: "" });
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // 2. Initialisation incluant les factures et le calcul du revenu
  useEffect(() => {
    const initStats = async () => {
      const types = [
        "doctors",
        "patients",
        "specialities",
        "appointments",
        "factures",
      ];
      const endpoints = {
        doctors: "http://localhost:5000/Admin/List/Doctor",
        patients: "http://localhost:5000/Admin/List/Patient",
        specialities: "http://localhost:5000/Admin/List/Speciality",
        appointments: "http://localhost:5000/Admin/List/Appointment",
        factures: "http://localhost:5000/Admin/List/Facture",
      };

      for (const t of types) {
        try {
          const res = await axios.get(endpoints[t]);
          let list = [];
          if (t === "doctors") list = res.data.Doctorlist;
          else if (t === "patients") list = res.data.Patientlist;
          else if (t === "specialities") list = res.data.Specialitylist;
          else if (t === "appointments") list = res.data.Appointmentlist;
          else if (t === "factures") {
            list = res.data.Facturelist;
            const total = (list || []).reduce(
              (acc, curr) => acc + (curr.amount || 0),
              0,
            );
            setStats((prev) => ({ ...prev, totalRevenue: total }));
          }
          setStats((prev) => ({ ...prev, [t]: (list || []).length }));
        } catch (e) {
          console.log(`Error ${t}:`, e);
        }
      }
    };
    initStats();
  }, []);

  const fetchData = async (type) => {
    setView(type);
    setLoading(true);
    setSearchTerm("");
    const endpoints = {
      doctors: "http://localhost:5000/Admin/List/Doctor",
      patients: "http://localhost:5000/Admin/List/Patient",
      specialities: "http://localhost:5000/Admin/List/Speciality",
      appointments: "http://localhost:5000/Admin/List/Appointment",
      factures: "http://localhost:5000/Admin/List/Facture",
    };
    try {
      const res = await axios.get(endpoints[type]);
      let list =
        type === "doctors"
          ? res.data.Doctorlist
          : type === "patients"
            ? res.data.Patientlist
            : type === "specialities"
              ? res.data.Specialitylist
              : type === "factures"
                ? res.data.Facturelist
                : res.data.Appointmentlist;
      setDataList(list || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (item) => {
    setEditMode(true);
    setCurrentId(item.id || item._id);
    setNewSpec({ name: item.name, description: item.description });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode)
        await axios.put(
          `http://localhost:5000/Admin/Update/Speciality/${currentId}`,
          newSpec,
        );
      else
        await axios.post("http://localhost:5000/Admin/Add/Speciality", newSpec);
      setShowModal(false);
      setEditMode(false);
      setNewSpec({ name: "", description: "" });
      fetchData("specialities");
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    }
  };

  const handleDelete = async (item, type) => {
    const idToDelete =
      item.id || (item._id && item._id.$oid ? item._id.$oid : item._id);
    if (!window.confirm(`Supprimer ?`)) return;
    const endpoints = {
      doctors: `http://localhost:5000/Admin/Delete/Doctor/${idToDelete}`,
      patients: `http://localhost:5000/Admin/Delete/Patient/${idToDelete}`,
      specialities: `http://localhost:5000/Admin/Delete/Speciality/${idToDelete}`,
      appointments: `http://localhost:5000/Admin/Delete/Appointment/${idToDelete}`,
      factures: `http://localhost:5000/Admin/Delete/Facture/${idToDelete}`,
    };
    try {
      await axios.delete(endpoints[type]);
      fetchData(type);
    } catch (err) {
      alert("Erreur suppression");
    }
  };

  const filteredList = dataList.filter((item) => {
    const search = searchTerm.toLowerCase();
    return (item.username || item.name || item.patient_name || "")
      .toLowerCase()
      .includes(search);
  });

  return (
    <div
      className="login-container"
      style={{ alignItems: "stretch", padding: 0 }}
    >
      {/* Sidebar */}
      <div
        className="login-info"
        style={{ flex: "0 0 250px", borderRadius: 0, background: "#1e293b" }}
      >
        <h2 style={{ marginBottom: "40px", color: "#60a5fa" }}>Admin Panel</h2>
        <nav
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <button
            className={`nav-btn ${view === "overview" ? "active" : ""}`}
            onClick={() => setView("overview")}
          >
            <Users size={18} /> Dashboard
          </button>
          <button
            className={`nav-btn ${view === "doctors" ? "active" : ""}`}
            onClick={() => fetchData("doctors")}
          >
            <UserRound size={18} /> Docteurs
          </button>
          <button
            className={`nav-btn ${view === "patients" ? "active" : ""}`}
            onClick={() => fetchData("patients")}
          >
            <Users size={18} /> Patients
          </button>
          <button
            className={`nav-btn ${view === "appointments" ? "active" : ""}`}
            onClick={() => fetchData("appointments")}
          >
            <Calendar size={18} /> Rendez-vous
          </button>
          <button
            className={`nav-btn ${view === "specialities" ? "active" : ""}`}
            onClick={() => fetchData("specialities")}
          >
            <Award size={18} /> Spécialités
          </button>
          <button
            className={`nav-btn ${view === "factures" ? "active" : ""}`}
            onClick={() => fetchData("factures")}
          >
            <FileText size={18} /> Factures
          </button>
          <hr style={{ border: "0.5px solid #334155", margin: "10px 0" }} />
          <button
            className="login-btn"
            style={{
              width: "auto",
              padding: "10px 20px",
              backgroundColor: "#10b981",
            }}
            onClick={() => {
              setEditMode(false);
              setNewSpec({ name: "", description: "" });
              setShowModal(true);
            }}
          >
            <Plus size={18} /> Ajouter Spécialité
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div
        className="login-form-section"
        style={{ flex: 1, overflowY: "auto", padding: "40px" }}
      >
        {view === "overview" && (
          <div
            className="stats-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "50px",
            }}
          >
            <StatCard
              title="Docteurs"
              count={stats.doctors}
              icon={<UserRound color="#2563eb" />}
            />
            <StatCard
              title="Patients"
              count={stats.patients}
              icon={<Users color="#ef4444" />}
            />
            <StatCard
              title="Rendez-vous"
              count={stats.appointments}
              icon={<Calendar color="#f59e0b" />}
            />
            <StatCard
              title="Spécialités"
              count={stats.specialities}
              icon={<Award color="#10b981" />}
            />
            <StatCard
              title="Factures"
              count={stats.factures}
              icon={<FileText color="#8b5cf6" />}
            />
            <StatCard
              title="Revenu Global"
              count={`${stats.totalRevenue} DT`}
              icon={<DollarSign color="#059669" />}
            />
          </div>
        )}

        {view !== "overview" && (
          <div className="data-table-container">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "30px",
              }}
            >
              <h1 className="form-title">Liste des {view}</h1>
              <div style={{ position: "relative", width: "300px" }}>
                <Search
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                  }}
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 10px 10px 40px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                  }}
                />
              </div>
            </div>

            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>
                    {view === "factures"
                      ? "Patient"
                      : view === "appointments"
                        ? "Détails"
                        : "Nom / Info"}
                  </th>
                  <th>{view === "factures" ? "Montant" : "Email / Desc"}</th>
                  <th>{view === "factures" ? "Statut" : "Actions"}</th>
                  {view !== "factures" && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredList.map((item, index) => (
                  <tr key={index}>
                    <td>#{item.id || index + 1}</td>
                    <td>{item.patient_name || item.username || item.name}</td>
                    <td
                      style={{
                        fontWeight: view === "factures" ? "bold" : "normal",
                      }}
                    >
                      {view === "factures"
                        ? `${item.amount} DT`
                        : item.email || item.description || item.date}
                    </td>
                    {view === "factures" && (
                      <td>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            background:
                              item.status === "Paid" ? "#dcfce7" : "#fee2e2",
                            color:
                              item.status === "Paid" ? "#15803d" : "#b91c1c",
                          }}
                        >
                          {item.status}
                        </span>
                      </td>
                    )}
                    <td>
                      <div style={{ display: "flex", gap: "10px" }}>
                        {view === "specialities" && (
                          <button
                            onClick={() => handleEditClick(item)}
                            style={{
                              color: "#2563eb",
                              border: "none",
                              background: "none",
                              cursor: "pointer",
                            }}
                          >
                            <Edit size={16} />
                          </button>
                        )}
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(item, view)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal (Ajout/Edit Spécialité) */}
        {showModal && (
          <div className="modal-overlay">
            <div className="login-card" style={{ maxWidth: "400px" }}>
              <h2 className="form-title">
                {editMode ? "Modifier" : "Nouvelle"} Spécialité
              </h2>
              <form onSubmit={handleSubmit}>
                <input
                  className="input-group"
                  type="text"
                  placeholder="Nom"
                  value={newSpec.name}
                  onChange={(e) =>
                    setNewSpec({ ...newSpec, name: e.target.value })
                  }
                  required
                />
                <textarea
                  className="input-group"
                  style={{
                    width: "100%",
                    minHeight: "80px",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                  }}
                  placeholder="Description"
                  value={newSpec.description}
                  onChange={(e) =>
                    setNewSpec({ ...newSpec, description: e.target.value })
                  }
                />
                <div
                  style={{ display: "flex", gap: "10px", marginTop: "10px" }}
                >
                  <button type="submit" className="login-button">
                    {editMode ? "Mettre à jour" : "Enregistrer"}
                  </button>
                  <button
                    type="button"
                    className="login-button"
                    style={{ backgroundColor: "#94a3b8" }}
                    onClick={() => setShowModal(false)}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, count, icon }) => (
  <div
    className="login-card"
    style={{
      padding: "20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      background: "white",
      borderRadius: "12px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    }}
  >
    <div>
      <p style={{ color: "#94a3b8", fontSize: "12px", margin: 0 }}>{title}</p>
      <h2 style={{ margin: 0, fontSize: "24px" }}>{count}</h2>
    </div>
    <div
      style={{ background: "#f1f5f9", padding: "10px", borderRadius: "10px" }}
    >
      {icon}
    </div>
  </div>
);

export default AdminDashboard;
