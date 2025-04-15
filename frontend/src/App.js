import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './Pages/Login';
import AdminDashboard from './Pages/AdminDashboard';
import AgentDashboard from './Pages/AgentDashboard';
import EditUserForm from './components/EditUserForm'; // adapte le chemin si besoin

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [message, setMessage] = useState('');

  // Fonction qui retourne le bon tableau de bord
  const renderDashboard = () => {
    if (userRole === "admin") {
      return <AdminDashboard />;
    } else if (userRole === "user") {
      return <AgentDashboard />;
    } else {
      return <div>Unknown role dashboard</div>;
    }
  };

  return (
    <Router>
      <Routes>
        {/* Page d’édition d’un utilisateur */}
        <Route path="/admin/edit-user/:id" element={<EditUserForm />} />

        {/* Page principale : login ou dashboard selon le statut */}
        <Route path="/" element={
          isLoggedIn ? (
            renderDashboard()
          ) : (
            <Login
              setIsLoggedIn={setIsLoggedIn}
              setUserRole={setUserRole}
              setMessage={setMessage}
              message={message}
            />
          )
        } />
      </Routes>
    </Router>
  );
}

export default App;