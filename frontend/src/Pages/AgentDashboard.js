import React from "react";
import Sidebar from "./Sidebar";
import "./Dashboard.css";

const AgentDashboard = () => {
  return (
    <div className="dashboard-container">
      {/* Barre latérale */}
      <Sidebar />

      {/* Contenu principal bien centré */}
      <main className="main-content">
        <h1 className="agent-title">Agent Dashboard</h1>
        <p>Welcome to the Agent Dashboard. Here you can manage your assignments.</p>
      </main>
    </div>
  );
};

export default AgentDashboard;
