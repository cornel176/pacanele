import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../styles/Admin.css';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingBalance, setEditingBalance] = useState(null);
  const [newBalance, setNewBalance] = useState('');
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin', {
        withCredentials: true
      });
      setUsers(response.data.users);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        await logout();
        navigate('/login');
      } else {
        setError(err.response?.data?.error || 'Eroare la încărcarea datelor');
      }
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
      await axios.delete(`/api/admin/users/${userId}`, {
        withCredentials: true
      });
      setSuccess('Utilizator șters cu succes!');
      setError(null);
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        await logout();
        navigate('/login');
      } else {
        setError(err.response?.data?.error || 'Eroare la ștergerea utilizatorului');
      }
      setSuccess(null);
    }
  };

  const handleToggleAdmin = async (userId, currentStatus) => {
    try {
      const response = await axios.post(
        `/api/admin/users/${userId}/toggle-admin`,
        {},
        { withCredentials: true }
      );
      setSuccess(response.data.message);
      setError(null);
      fetchUsers();
    } catch (err) {
      console.error('Error toggling admin status:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        await logout();
        navigate('/login');
      } else {
        setError(err.response?.data?.error || 'Eroare la actualizarea statusului administrator');
      }
      setSuccess(null);
    }
  };

  const handleUpdateBalance = async (userId) => {
    const balance = parseFloat(newBalance);
    if (isNaN(balance) || balance < 0) {
      setError('Introduceți o sumă validă!');
      return;
    }

    try {
      const response = await axios.post(
        `/api/admin/users/${userId}/update-balance`,
        { balance },
        { withCredentials: true }
      );
      setSuccess('Balanta actualizată cu succes!');
      setError(null);
      setEditingBalance(null);
      setNewBalance('');
      fetchUsers();
    } catch (err) {
      console.error('Error updating balance:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        await logout();
        navigate('/login');
      } else {
        setError(err.response?.data?.error || 'Eroare la actualizarea balanței');
      }
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
        <div className="admin-header">
          <h1>Admin Panel</h1>
          <button className="refresh-button" onClick={fetchUsers}>
            Refresh
          </button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="users-grid">
          {users.map((user) => (
            <div key={user.id} className="user-card">
              <div className="user-header">
                <h3>{user.username}</h3>
                <span className={`admin-badge ${user.is_admin ? 'is-admin' : ''}`}>
                  {user.is_admin ? 'Admin' : 'User'}
                </span>
              </div>
              <div className="user-details">
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <div className="balance-section">
                  <p><strong>Balance:</strong> ${parseFloat(user.balance).toFixed(2)}</p>
                  {editingBalance === user.id ? (
                    <div className="balance-edit">
                      <input
                        type="number"
                        value={newBalance}
                        onChange={(e) => setNewBalance(e.target.value)}
                        placeholder="New balance"
                        min="0"
                        step="0.01"
                      />
                      <div className="balance-actions">
                        <button onClick={() => handleUpdateBalance(user.id)}>Save</button>
                        <button onClick={() => {
                          setEditingBalance(null);
                          setNewBalance('');
                        }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="edit-balance-button"
                      onClick={() => {
                        setEditingBalance(user.id);
                        setNewBalance(user.balance);
                      }}
                      disabled={user.email === 'admin@example.com'}
                    >
                      Edit Balance
                    </button>
                  )}
                </div>
              </div>
              <div className="user-actions">
                <button
                  className={`toggle-admin-button ${user.is_admin ? 'is-admin' : ''}`}
                  onClick={() => handleToggleAdmin(user.id, user.is_admin)}
                  disabled={user.email === 'admin@example.com'}
                >
                  {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleDeleteUser(user.id)}
                  disabled={user.email === 'admin@example.com'}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 