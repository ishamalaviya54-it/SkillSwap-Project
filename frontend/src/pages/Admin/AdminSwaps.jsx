import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Modal from '../../components/Modal/Modal';
import Button from '../../components/Button/Button';
import Badge from '../../components/Badge/Badge';
import {
  Search,
  ArrowRightLeft,
  Eye,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Ban,
  Calendar,
  MessageSquare
} from 'lucide-react';
import './AdminSwaps.css';

export const AdminSwaps = () => {
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedSwap, setSelectedSwap] = useState(null);

  const fetchSwaps = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;

      const res = await API.get('/admin/swaps', { params });
      setSwaps(res.data?.data || res.data?.swaps || []);
    } catch (err) {
      console.error('Failed to load admin swaps', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchSwaps();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [statusFilter, search]);

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'accepted': return 'success';
      case 'completed': return 'purple';
      case 'pending': return 'warning';
      case 'rejected': return 'danger';
      case 'cancelled': return 'gray';
      default: return 'gray';
    }
  };

  const getSkillLabel = (skill) => {
    if (!skill) return 'Not Specified';
    if (typeof skill === 'string') return skill;
    if (skill.name) return skill.name;
    return 'Skill';
  };

  return (
    <div className="admin-swaps-container">
      <div className="admin-swaps-header">
        <div>
          <h2 className="admin-section-title">Swap Velocity & Exchange Monitoring</h2>
          <p className="admin-section-desc">
            Track barter proposals, review exchange agreements, and ensure community fairness.
          </p>
        </div>
        <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchSwaps}>
          Refresh
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-filter-bar card-glass">
        <div className="admin-search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by participant name or skill title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="swap-status-tabs">
          {['all', 'pending', 'accepted', 'completed', 'cancelled', 'rejected'].map((st) => (
            <button
              key={st}
              className={`swap-filter-btn ${statusFilter === st ? 'active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              {st.charAt(0).toUpperCase() + st.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Swaps Table */}
      <div className="admin-table-wrapper card-glass">
        {loading ? (
          <div className="admin-loading-state">
            <div className="spinner"></div>
            <p>Loading swap records...</p>
          </div>
        ) : swaps.length === 0 ? (
          <div className="admin-empty-state">
            <ArrowRightLeft size={40} className="empty-icon" />
            <p>No swap requests match the filter.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Requester</th>
                  <th>Peer (Recipient)</th>
                  <th>Offered Skill</th>
                  <th>Wanted Skill</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {swaps.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <div className="user-cell">
                        <span className="user-cell-name">{s.requester?.name || 'Unknown'}</span>
                        <span className="user-cell-email">{s.requester?.email || ''}</span>
                      </div>
                    </td>
                    <td>
                      <div className="user-cell">
                        <span className="user-cell-name">{s.recipient?.name || 'Unknown'}</span>
                        <span className="user-cell-email">{s.recipient?.email || ''}</span>
                      </div>
                    </td>
                    <td>
                      <span className="skill-tag skill-offered">
                        {getSkillLabel(s.offeredSkill)}
                      </span>
                    </td>
                    <td>
                      <span className="skill-tag skill-wanted">
                        {getSkillLabel(s.wantedSkill)}
                      </span>
                    </td>
                    <td>
                      <Badge variant={getStatusBadgeVariant(s.status)}>
                        {s.status}
                      </Badge>
                    </td>
                    <td className="text-muted">
                      {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button
                          onClick={() => setSelectedSwap(s)}
                          className="btn-action"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Swap Details Modal */}
      <Modal
        isOpen={!!selectedSwap}
        onClose={() => setSelectedSwap(null)}
        title="Swap Exchange Dossier"
      >
        {selectedSwap && (
          <div className="swap-details-modal">
            <div className="swap-parties-grid">
              <div className="party-box">
                <span className="party-label">Initiator / Requester</span>
                <strong className="party-name">{selectedSwap.requester?.name || 'Unknown'}</strong>
                <span className="party-email">{selectedSwap.requester?.email}</span>
                <div className="party-skill">
                  Offering: <span>{getSkillLabel(selectedSwap.offeredSkill)}</span>
                </div>
              </div>

              <div className="swap-direction-icon">
                <ArrowRightLeft size={24} />
              </div>

              <div className="party-box">
                <span className="party-label">Peer / Recipient</span>
                <strong className="party-name">{selectedSwap.recipient?.name || 'Unknown'}</strong>
                <span className="party-email">{selectedSwap.recipient?.email}</span>
                <div className="party-skill">
                  Wanted in Return: <span>{getSkillLabel(selectedSwap.wantedSkill)}</span>
                </div>
              </div>
            </div>

            <div className="swap-meta-info">
              <div className="meta-row">
                <span className="meta-key">Status:</span>
                <Badge variant={getStatusBadgeVariant(selectedSwap.status)}>
                  {selectedSwap.status}
                </Badge>
              </div>
              <div className="meta-row">
                <span className="meta-key">Date Requested:</span>
                <span className="meta-val">
                  {selectedSwap.createdAt ? new Date(selectedSwap.createdAt).toLocaleString() : 'N/A'}
                </span>
              </div>
              {selectedSwap.message && (
                <div className="meta-message-box">
                  <span className="meta-key"><MessageSquare size={14} /> Initial Proposal Note:</span>
                  <p className="meta-message-text">{selectedSwap.message}</p>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <Button variant="outline" size="md" onClick={() => setSelectedSwap(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminSwaps;

