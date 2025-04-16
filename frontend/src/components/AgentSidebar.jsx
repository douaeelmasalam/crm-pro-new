import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Sidebar.css';

const AgentSidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>CRM-PRO</h2>
        <p>Agent Panel</p>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/agent/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
              Dashboard
            </NavLink>
          </li>
          
          <li className="nav-section">
            <h3>TICKETS</h3>
            <ul>
              <li>
                <NavLink to="/agent/tickets" className={({ isActive }) => isActive ? 'active' : ''}>
                  Tickets List
                </NavLink>
              </li>
              <li>
                <NavLink to="/agent/tickets/create" className={({ isActive }) => isActive ? 'active' : ''}>
                  Create Ticket
                </NavLink>
              </li>
            </ul>
          </li>
          
          <li className="nav-section">
            <h3>DEMANDS</h3>
            <ul>
              <li>
                <NavLink to="/agent/demands" className={({ isActive }) => isActive ? 'active' : ''}>
                  Demands List
                </NavLink>
              </li>
              <li>
                <NavLink to="/agent/demands/create" className={({ isActive }) => isActive ? 'active' : ''}>
                  New Demand
                </NavLink>
              </li>
            </ul>
          </li>
          
          <li className="nav-section">
            <h3>TASKS</h3>
            <ul>
              <li>
                <NavLink to="/agent/tasks" className={({ isActive }) => isActive ? 'active' : ''}>
                  Tasks List
                </NavLink>
              </li>
              <li>
                <NavLink to="/agent/tasks/create" className={({ isActive }) => isActive ? 'active' : ''}>
                  New Task
                </NavLink>
              </li>
            </ul>
          </li>
          
          <li className="nav-section">
            <h3>PROFILE</h3>
            <ul>
              <li>
                <NavLink to="/agent/profile" className={({ isActive }) => isActive ? 'active' : ''}>
                  My Profile
                </NavLink>
              </li>
              <li>
                <NavLink to="/agent/change-password" className={({ isActive }) => isActive ? 'active' : ''}>
                  Change Password
                </NavLink>
              </li>
              <li>
                <NavLink to="/logout" className={({ isActive }) => isActive ? 'active' : ''}>
                  Logout
                </NavLink>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default AgentSidebar;