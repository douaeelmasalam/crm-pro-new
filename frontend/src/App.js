import { useState } from 'react';
import Login from './Pages/Login'; // Notez le "P" majuscule pour correspondre à votre dossier
import AdminDashboard from './Pages/AdminDashboard'; // Utilisez le bon chemin
import AgentDashboard from './Pages/AgentDashboard'; // Utilisez le bon chemin

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [message, setMessage] = useState('');

  // Function to render the appropriate dashboard based on role
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
    <div>
      {isLoggedIn ? (
        renderDashboard()
      ) : (
        <Login 
          setIsLoggedIn={setIsLoggedIn} 
          setUserRole={setUserRole} 
          setMessage={setMessage}
          message={message}
        />
      )}
    </div>
  );
}

export default App;