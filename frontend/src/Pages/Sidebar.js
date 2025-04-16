import React from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      {/* Titre Agent en grand */}
      <h2 className="agent-title"> AGENT</h2>

      {/* Menu avec boutons encadrés */}
      <div className="menu-container">
        <Link to="/agent/dashboard" className="menu-button">📊 Tableau de Bord</Link>
        <Link to="/agent/tickets" className="menu-button">🎫 Tickets Clients</Link>
        <Link to="/agent/demandes" className="menu-button">📩 Demandes Clients</Link>
        <Link to="/agent/taches" className="menu-button">  Tâches Administratives</Link>
        <Link to="/agent/settings" className="menu-button">Profile </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
