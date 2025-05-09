import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Pages/Login";
import AdminDashboard from "./Pages/AdminDashboard";
import AgentDashboard from "./Pages/AgentDashboard";
import EditUserForm from "./components/EditUserForm";
import CreateTicketForm from "./components/CreateTicketForm";
import ClientForm from "./components/ClientForm";
import Demandes from "./Pages/Demandes";
import Taches from "./Pages/Taches";
import Settings from "./Pages/Settings";
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(""); // "admin" ou "agent"
  const [message, setMessage] = useState("");
  
  useEffect(() => {
    if (isLoggedIn && userRole === "agent") {
      fetch("http://localhost:3000/api/dashboard")
        .then((response) => response.json())
        .then((data) => setMessage(data.message))
        .catch((error) => console.error("Erreur lors de la récupération du message:", error));
    }
  }, [isLoggedIn, userRole]);
  
  const PrivateRoute = ({ element }) => {
    return isLoggedIn ? element : <Navigate to="/" />;
  };
  
  return (
    <div className="app-container">
      <Routes>
        {/* Page d'accueil / Connexion */}
        <Route 
          path="/" 
          element={
            isLoggedIn ? (
              userRole === "admin" ? (
                <Navigate to="/admin/dashboard" />
              ) : (
                <Navigate to="/agent/dashboard" />
              )
            ) : (
              <Login 
                   setIsLoggedIn={setIsLoggedIn} 
                   setUserRole={setUserRole} 
                   setMessage={setMessage} 
                   message={message}
              />
            )
          } 
        />
        
        {/* 🛠️ Pages Admin */}
        <Route path="/admin/dashboard" element={<PrivateRoute element={<AdminDashboard />} />} />
        <Route path="/admin/edit-user/:id" element={<PrivateRoute element={<EditUserForm />} />} />
        <Route path="/admin/demandes" element={<PrivateRoute element={<Demandes />} />} />
        
        {/* 🧑‍💼 Pages Agent */}
        <Route path="/agent/dashboard" element={<PrivateRoute element={<AgentDashboard />} />} />
        <Route path="/agent/create-ticket" element={<PrivateRoute element={<CreateTicketForm />} />} />
        <Route path="/agent/taches" element={<PrivateRoute element={<Taches />} />} />
        <Route path="/agent/settings" element={<PrivateRoute element={<Settings />} />} />
        
        {/* Toutes les routes liées aux clients sont maintenant gérées par les dashboards respectifs */}
      </Routes>
      
      {isLoggedIn && (
        <footer className="app-footer">
          © 2025 - PRO-MIACORP System
        </footer>
      )}
    </div>
  );
}

export default App;