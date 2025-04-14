import React from 'react';
import CreateUserForm from './CreateUserForm'; // Assure-toi du chemin correct

function AdminDashboard() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome to the Admin Dashboard. Here you can manage users and system settings.</p>
      {/* Ajoute le formulaire ici */}
      <CreateUserForm />
    </div>
  );
}

export default AdminDashboard;
