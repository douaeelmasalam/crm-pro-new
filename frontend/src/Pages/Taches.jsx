import React, { useState, useEffect } from 'react';
import '../styles/Tasks.css';

const AgentTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    // Fetch tasks from API
    const fetchTasks = async () => {
      try {
        // This would be an actual API call in production
        // const response = await fetch('/api/agent/tasks');
        // const data = await response.json();
        
        // Placeholder data
        const mockTasks = [
          { id: 'TA-187', title: 'Follow-up with client', description: 'Call Acme Corp about recent implementation', status: 'pending', priority: 'high', deadline: '2025-04-18' },
          { id: 'TA-186', title: 'Prepare monthly report', description: 'Generate performance report for management', status: 'in_progress', priority: 'medium', deadline: '2025-04-20' },
          { id: 'TA-185', title: 'Update documentation', description: 'Add new API endpoints to documentation', status: 'completed', priority: 'low', deadline: '2025-04-15' },
          { id: 'TA-184', title: 'Client presentation', description: 'Prepare slides for TechGlobal demo', status: 'pending', priority: 'high', deadline: '2025-04-22' },
          { id: 'TA-183', title: 'Code review', description: 'Review pull request #42 for backend changes', status: 'in_progress', priority: 'medium', deadline: '2025-04-17' },
        ];
        
        setTasks(mockTasks);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, []);
  
  const filteredTasks = filter === 'all' 
    ? tasks 
    : tasks.filter(task => task.status === filter);
  
  const getStatusLabel = (status) => {
    switch(status) {
      case 'pending':
        return 'Pending';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };
  
  const getStatusClass = (status) => {
    switch(status) {
      case 'pending':
        return 'status-pending';
      case 'in_progress':
        return 'status-in-progress';
      case 'completed':
        return 'status-completed';
      default:
        return '';
    }
  };
  
  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return '';
    }
  };
  
  const isTaskOverdue = (deadline) => {
    const today = new Date();
    const taskDeadline = new Date(deadline);
    return today > taskDeadline;
  };
  
  return (
    <div className="tasks-container">
      <div className="tasks-header">
        <h1>Administrative Tasks</h1>
        <div className="tasks-actions">
          <div className="filter-controls">
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <a href="/agent/tasks/create" className="create-button">New Task</a>
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Loading tasks...</div>
      ) : (
        <div className="tasks-list">
          <table className="tasks-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Description</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Deadline</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length > 0 ? (
                filteredTasks.map(task => (
                  <tr key={task.id} className={isTaskOverdue(task.deadline) && task.status !== 'completed' ? 'overdue-task' : ''}>
                    <td>{task.id}</td>
                    <td>{task.title}</td>
                    <td className="task-description">{task.description}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(task.status)}`}>
                        {getStatusLabel(task.status)}
                      </span>
                    </td>
                    <td>
                      <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                    </td>
                    <td className={isTaskOverdue(task.deadline) && task.status !== 'completed' ? 'overdue-date' : ''}>
                      {task.deadline}
                      {isTaskOverdue(task.deadline) && task.status !== 'completed' && <span className="overdue-label"> (Overdue)</span>}
                    </td>
                    <td>
                      <div className="task-actions">
                        <button className="action-btn view-btn">View</button>
                        <button className="action-btn edit-btn">Edit</button>
                        {task.status !== 'completed' && (
                          <button className="action-btn complete-btn">Complete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-tasks">No tasks found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AgentTasks;