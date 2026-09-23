import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Modal from '../../components/Modal/Modal';
import Button from '../../components/Button/Button';
import Badge from '../../components/Badge/Badge';
import {
  Search,
  UserX,
  UserCheck,
  Trash2,
  Shield,
  MapPin,
  RefreshCw,
  AlertTriangle,
  UserCheck2
} from 'lucide-react';
import './AdminUsers.css';

export const AdminUsers = ({ onUserModified }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [bannedFilter, setBannedFilter] = useState('all');
  const [actionUser, setActionUser] = useState(null);
  const [modalType, setModalType] = useState(null); // 'ban' or 'delete'
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const params = {};
      if (search) params.search = search;
      if (roleFilter !== 'all') params.role = roleFilter;
      if (bannedFilter !== 'all') params.banned = bannedFilter;

      const res = await API.get('/admin/users', { params });
      setUsers(res.data?.data || res.data?.users || []);
    } catch (err) {
      console.error('Failed to load users', err);
      setErrorMsg(err.response?.data?.message || 'Could not load users list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, roleFilter, bannedFilter]);

  const handleConfirmBan = async () => {
    if (!actionUser) return;
    try {
      setProcessing(true);
      await API.put(`/admin/users/${actionUser._id}/ban`);
      setModalType(null);
      setActionUser(null);
      await fetchUsers();
      if (onUserModified) onUserModified();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user ban status');
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!actionUser) return;
    try {
      setProcessing(true);
      await API.delete(`/admin/users/${actionUser._id}`);
      setModalType(null);
      setActionUser(null);
      await fetchUsers();
      if (onUserModified) onUserModified();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove user account');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="admin-users-container">
      <div className="admin-users-header">
        <div>
          <h2 className="admin-section-title">User Accounts Directory</h2>
          <p className="admin-section-desc">
            Manage permissions, moderate platform accounts, and enact safety restrictions.
          </p>
        </div>
        <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchUsers}>
          Refresh
        </Button>
      </div>

      {/* Search and Filters Bar */}
      <div className="admin-filter-bar card-glass">
        <div className="admin-search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by name, email, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="admin-filter-dropdowns">
          <select
            className="admin-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="user">Members</option>
            <option value="admin">Administrators</option>
          </select>

          <select
            className="admin-select"
            value={bannedFilter}
            onChange={(e) => setBannedFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="false">Active Only</option>
            <option value="true">Banned Only</option>
          </select>
        </div>
      </div>

      {errorMsg && <div className="admin-error-banner">{errorMsg}</div>}

      {/* Users Table */}
      <div className="admin-table-wrapper card-glass">
        {loading ? (
          <div className="admin-loading-state">
            <div className="spinner"></div>
            <p>Loading accounts...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="admin-empty-state">
            <UserCheck2 size={40} className="empty-icon" />
            <p>No user accounts matched the filter criteria.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Location</th>
                  <th>Skills (Offered / Wanted)</th>
                  <th>Status</th>
                  <th>Joined Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const offeredCount = u.skillsOffered?.length || 0;
                  const wantedCount = u.skillsWanted?.length || 0;
                  return (
                    <tr key={u._id} className={u.isBanned ? 'row-banned' : ''}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar-mini">
                            {u.profilePhoto || u.avatar ? (
                              <img src={u.profilePhoto || u.avatar} alt={u.name} />
                            ) : (
                              <span>{u.name?.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div>
                            <span className="user-cell-name">{u.name}</span>
                            <span className="user-cell-email">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge variant={u.role === 'admin' ? 'purple' : 'gray'}>
                          {u.role === 'admin' ? 'Admin' : 'Member'}
                        </Badge>
                      </td>
                      <td>
                        <div className="location-cell">
                          <MapPin size={14} />
                          <span>{u.location || 'Not Specified'}</span>
                        </div>
                      </td>
                      <td>
                        <span className="skills-count-pill">
                          {offeredCount} offered / {wantedCount} wanted
                        </span>
                      </td>
                      <td>
                        <Badge variant={u.isBanned ? 'danger' : 'success'}>
                          {u.isBanned ? 'Banned' : 'Active'}
                        </Badge>
                      </td>
                      <td className="text-muted">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button
                            onClick={() => {
                              setActionUser(u);
                              setModalType('ban');
                            }}
                            className={`btn-action ${u.isBanned ? 'btn-unban' : 'btn-ban'}`}
                            title={u.isBanned ? 'Lift Ban' : 'Enact Ban'}
                          >
                            {u.isBanned ? <UserCheck size={16} /> : <UserX size={16} />}
                          </button>
                          <button
                            onClick={() => {
                              setActionUser(u);
                              setModalType('delete');
                            }}
                            className="btn-action btn-delete"
                            title="Remove User"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!modalType}
        onClose={() => {
          setModalType(null);
          setActionUser(null);
        }}
        title={modalType === 'ban' ? (actionUser?.isBanned ? 'Lift Account Ban' : 'Enact Account Ban') : 'Delete User Account'}
      >
        <div className="confirmation-modal-content">
          <AlertTriangle size={36} className="modal-alert-icon" />
          <p>
            {modalType === 'ban' ? (
              actionUser?.isBanned ? (
                <>Are you sure you want to restore access for <strong>{actionUser?.name}</strong> ({actionUser?.email})?</>
              ) : (
                <>Are you sure you want to ban <strong>{actionUser?.name}</strong> ({actionUser?.email})? They will be blocked from submitting swaps or accessing the platform.</>
              )
            ) : (
              <>Are you sure you want to permanently delete <strong>{actionUser?.name}</strong>? This action cannot be undone and will purge associated swaps and ratings.</>
            )}
          </p>
          <div className="modal-actions">
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setModalType(null);
                setActionUser(null);
              }}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant={modalType === 'delete' ? 'danger' : (actionUser?.isBanned ? 'primary' : 'warning')}
              size="md"
              onClick={modalType === 'ban' ? handleConfirmBan : handleConfirmDelete}
              disabled={processing}
            >
              {processing ? 'Processing...' : (modalType === 'ban' ? (actionUser?.isBanned ? 'Unban User' : 'Ban User') : 'Delete Account')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminUsers;

