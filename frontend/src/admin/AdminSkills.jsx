import React, { useState, useEffect } from 'react';
import API from '../services/api';
import Modal from '../components/Modal/Modal';
import Button from '../components/Button/Button';
import Badge from '../components/Badge/Badge';
import {
  Search,
  Sparkles,
  Edit3,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Filter,
  Check
} from 'lucide-react';
import './AdminSkills.css';

export const AdminSkills = ({ onSkillModified }) => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [moderatingSkill, setModeratingSkill] = useState(null);
  const [deletingSkill, setDeletingSkill] = useState(null);
  const [newDescription, setNewDescription] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (categoryFilter !== 'all') params.category = categoryFilter;

      const res = await API.get('/admin/skills', { params });
      setSkills(res.data?.data || res.data?.skills || []);
    } catch (err) {
      console.error('Failed to load skills for moderation', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchSkills();
    }, 300);
    return () => clearTimeout(delay);
  }, [search, categoryFilter]);

  const handleOpenModerateModal = (skill) => {
    setModeratingSkill(skill);
    setNewDescription(skill.description || '');
  };

  const handleSaveModeration = async (e) => {
    e.preventDefault();
    if (!moderatingSkill) return;
    try {
      setProcessing(true);
      await API.put(`/admin/skills/${moderatingSkill._id}/moderate`, {
        userId: moderatingSkill.userId || moderatingSkill.owner?._id,
        skillType: moderatingSkill.type,
        skillName: moderatingSkill.name,
        newDescription: newDescription.trim() || '[Content moderated by Admin]'
      });

      setModeratingSkill(null);
      await fetchSkills();
      if (onSkillModified) onSkillModified();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to moderate skill');
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingSkill) return;
    try {
      setProcessing(true);
      await API.delete(`/admin/skills/${deletingSkill._id}`);
      setDeletingSkill(null);
      await fetchSkills();
      if (onSkillModified) onSkillModified();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete skill');
    } finally {
      setProcessing(false);
    }
  };

  const categories = Array.from(new Set(skills.map((s) => s.category).filter(Boolean)));

  return (
    <div className="admin-skills-container">
      <div className="admin-skills-header">
        <div>
          <h2 className="admin-section-title">Skill Catalog Moderation</h2>
          <p className="admin-section-desc">
            Enforce community guidelines, sanitize inappropriate descriptions, and remove spam listings.
          </p>
        </div>
        <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchSkills}>
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
            placeholder="Search by skill name, description, or owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="admin-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Skills Table */}
      <div className="admin-table-wrapper card-glass">
        {loading ? (
          <div className="admin-loading-state">
            <div className="spinner"></div>
            <p>Loading skills catalog...</p>
          </div>
        ) : skills.length === 0 ? (
          <div className="admin-empty-state">
            <Sparkles size={40} className="empty-icon" />
            <p>No skills found matching your filters.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Skill Name</th>
                  <th>Category / Type</th>
                  <th>Owner</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {skills.map((skill) => (
                  <tr key={skill._id}>
                    <td>
                      <strong className="skill-name-highlight">{skill.name}</strong>
                    </td>
                    <td>
                      <Badge variant={skill.type === 'offered' ? 'primary' : 'purple'}>
                        {skill.category || 'General'}
                      </Badge>
                    </td>
                    <td>
                      <div className="user-cell">
                        <span className="user-cell-name">{skill.ownerName || skill.owner?.name || 'Community Member'}</span>
                        <span className="user-cell-email">{skill.ownerEmail || skill.owner?.email || ''}</span>
                      </div>
                    </td>
                    <td>
                      <span className="skill-desc-cell">
                        {skill.description || <em className="text-subtle">No description provided</em>}
                      </span>
                    </td>
                    <td className="text-muted">
                      {skill.createdAt ? new Date(skill.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button
                          onClick={() => handleOpenModerateModal(skill)}
                          className="btn-action"
                          title="Moderate Description"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => setDeletingSkill(skill)}
                          className="btn-action btn-delete"
                          title="Delete Skill"
                        >
                          <Trash2 size={16} />
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

      {/* Moderate Description Modal */}
      <Modal
        isOpen={!!moderatingSkill}
        onClose={() => setModeratingSkill(null)}
        title={`Moderate Description: "${moderatingSkill?.name}"`}
      >
        <form onSubmit={handleSaveModeration} className="moderate-skill-form">
          <p className="modal-guidance">
            Update or sanitize the skill description for <strong>{moderatingSkill?.name}</strong> owned by {moderatingSkill?.ownerName}.
          </p>

          <div className="form-group">
            <label className="form-label">Skill Description</label>
            <textarea
              className="form-textarea"
              rows={4}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Enter sanitized description or policy violation replacement..."
              required
            />
          </div>

          <div className="preset-badges">
            <button
              type="button"
              className="preset-btn"
              onClick={() => setNewDescription('[Content moderated by Admin: Inappropriate language removed]')}
            >
              Preset: Inappropriate Language
            </button>
            <button
              type="button"
              className="preset-btn"
              onClick={() => setNewDescription('[Content moderated by Admin: External contact info removed]')}
            >
              Preset: External Contact Info
            </button>
          </div>

          <div className="modal-actions">
            <Button variant="outline" size="md" type="button" onClick={() => setModeratingSkill(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" disabled={processing}>
              {processing ? 'Saving...' : 'Save Moderation'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingSkill}
        onClose={() => setDeletingSkill(null)}
        title="Remove Skill Listing"
      >
        <div className="confirmation-modal-content">
          <AlertTriangle size={36} className="modal-alert-icon" />
          <p>
            Are you sure you want to delete the skill <strong>"{deletingSkill?.name}"</strong>? This will remove the listing from public exploration and the owner's profile.
          </p>
          <div className="modal-actions">
            <Button variant="outline" size="md" onClick={() => setDeletingSkill(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="md" onClick={handleConfirmDelete} disabled={processing}>
              {processing ? 'Deleting...' : 'Delete Skill'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminSkills;

