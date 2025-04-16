import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./Pages/Login";
import AdminDashboard from "./Pages/AdminDashboard";
import AgentDashboard from "./Pages/AgentDashboard";
import EditUserForm from "./components/EditUserForm";
import Tickets from "./Pages/Tickets";
import Demandes from "./Pages/Demandes";
import Taches from "./Pages/Taches";
import Settings from "./Pages/Settings";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(""); // "admin" ou "agent"
  const [message, setMessage] = useState("");

  // Récupérer le message du backend quand l'utilisateur est connecté
  useEffect(() => {
    if (isLoggedIn && userRole === "agent") {
      fetch("http://localhost:3000/api/dashboard")
        .then(response => response.json())
        .then(data => setMessage(data.message))
        .catch(error => console.error("Erreur lors de la récupération du message:", error));
    }
  }, [isLoggedIn, userRole]);

  // Gestion des accès sécurisés
  const PrivateRoute = ({ element }) => {
    return isLoggedIn ? element : <Navigate to="/" />;
  };

  return (
    <Router>
      <Routes>
        {/* Redirection après connexion */}
        <Route
          path="/"
          element={
            isLoggedIn ? (
              userRole === "admin" ? <Navigate to="/admin/dashboard" /> : <Navigate to="/agent/dashboard" />
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

        {/* Dashboard Admin */}
        <Route path="/admin/dashboard" element={<PrivateRoute element={<AdminDashboard />} />} />
        <Route path="/admin/edit-user/:id" element={<PrivateRoute element={<EditUserForm />} />} />

        {/* Dashboard Agent */}
        <Route path="/agent/dashboard">
  <Route index element={<AgentDashboard />} /> {/* Page principale */}
  <Route path="*" element={<AgentDashboard />} /> {/* Pour les sous-routes */}
</Route>

        <Route path="/agent/tickets" element={<PrivateRoute element={<Tickets />} />} />
        <Route path="/agent/demandes" element={<PrivateRoute element={<Demandes />} />} />
        <Route path="/agent/taches" element={<PrivateRoute element={<Taches />} />} />
        <Route path="/agent/settings" element={<PrivateRoute element={<Settings />} />} />
      </Routes>
    </Router>
  );
}

export default App;
