import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../styles/Admin.css';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin', {
        withCredentials: true
      });
      setUsers(response.data.users);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.error || 'Eroare la încărcarea datelor');
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !user?.is_admin) {
      navigate('/');
      return;
    }

    fetchUsers();
  }, [isAuthenticated, user, navigate]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Sigur doriți să ștergeți acest utilizator?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        withCredentials: true
      });
      setSuccess('Utilizator șters cu succes!');
      setError(null);
      // Refresh the users list
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.response?.data?.error || 'Eroare la ștergerea utilizatorului');
      setSuccess(null);
    }
  };

  if (!isAuthenticated || !user?.is_admin) {
    return null;
  }

  return (
    <div className="admin-container">
      <button className="btn-home" onClick={() => navigate("/")}>
        Home
      </button>

      <div className="admin-panel">
        <h1>Admin Panel</h1>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Balance</th>
                <th>Admin</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>${parseFloat(user.balance).toFixed(2)}</td>
                  <td>{user.is_admin ? 'Yes' : 'No'}</td>
                  <td>
                    <button 
                      className="delete-button"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={user.email === 'admin@example.com'} // Prevent deleting the main admin
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 