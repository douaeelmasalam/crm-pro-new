import React from 'react';
import CreateUserForm from './CreateUserForm'; 
import UserList from '../components/UserList';

function AdminDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p className="mb-6">Bienvenue sur le tableau de bord administrateur.</p>

      {/* Formulaire de création d'utilisateur */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold mb-2">Créer un nouvel utilisateur</h2>
        <CreateUserForm />
      </div>

      {/* Liste des utilisateurs */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Utilisateurs existants</h2>
        <UserList />
      </div>
    </div>
  );
}

export default AdminDashboard;

