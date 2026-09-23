import React, { useState, useEffect } from 'react';
import API from '../services/api';
import Button from '../components/Button/Button';
import Badge from '../components/Badge/Badge';
import {
  Download,
  Calendar,
  Search,
  Filter,
  FileSpreadsheet,
  RefreshCw,
  Users,
  ArrowRightLeft,
  Star
} from 'lucide-react';
import './AdminReports.css';

export const AdminReports = () => {
  const [reportType, setReportType] = useState('activity');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [reportData, setReportData] = useState({ rows: [], summary: {} });
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = { type: reportType };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;

      const res = await API.get('/admin/reports', { params });
      setReportData({
        rows: res.data?.data || res.data?.rows || [],
        summary: res.data?.summary || {}
      });
    } catch (err) {
      console.error('Failed to load report data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType, startDate, endDate, statusFilter, search]);

  const handleDownloadCSV = () => {
    const rows = reportData.rows;
    if (!rows || rows.length === 0) {
      alert('No data rows to export for current filter criteria.');
      return;
    }

    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        headers
          .map((h) => `"${String(row[h] !== undefined ? row[h] : '').replace(/"/g, '""')}"`)
          .join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `SkillSwap_Report_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const reportTypes = [
    { id: 'activity', label: 'User Activity' },
    { id: 'swaps', label: 'Swap Statistics' },
    { id: 'ratings', label: 'Feedback & Ratings' },
    { id: 'pending-swaps', label: 'Pending Swaps' },
    { id: 'accepted-swaps', label: 'Accepted Swaps' },
    { id: 'cancelled-swaps', label: 'Cancelled Swaps' }
  ];

  return (
    <div className="admin-reports-container">
      <div className="admin-reports-header">
        <div>
          <h2 className="admin-section-title">Platform Audit & Operational Reports</h2>
          <p className="admin-section-desc">
            Analyze platform-wide transactions, member engagement, and export data in standard CSV format.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Download}
          onClick={handleDownloadCSV}
          disabled={loading || reportData.rows.length === 0}
        >
          Download CSV
        </Button>
      </div>

      {/* Report Categories Tabs */}
      <div className="report-types-tabs card-glass">
        {reportTypes.map((t) => (
          <button
            key={t.id}
            className={`report-tab-btn ${reportType === t.id ? 'active' : ''}`}
            onClick={() => setReportType(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters Bar: Date, Status, Search */}
      <div className="report-filters-bar card-glass">
        <div className="filter-group-item search-item">
          <Search size={16} className="filter-icon" />
          <input
            type="text"
            className="filter-input"
            placeholder="Search report records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group-item">
          <Calendar size={16} className="filter-icon" />
          <input
            type="date"
            className="filter-date-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            title="Start Date"
          />
          <span className="date-separator">to</span>
          <input
            type="date"
            className="filter-date-input"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            title="End Date"
          />
        </div>

        {['swaps', 'pending-swaps', 'accepted-swaps', 'cancelled-swaps'].includes(reportType) && (
          <div className="filter-group-item">
            <Filter size={16} className="filter-icon" />
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        )}

        {(startDate || endDate || search || statusFilter !== 'all') && (
          <button
            className="btn-clear-filters"
            onClick={() => {
              setStartDate('');
              setEndDate('');
              setSearch('');
              setStatusFilter('all');
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Summary KPI Bar */}
      {reportData.summary && Object.keys(reportData.summary).length > 0 && (
        <div className="report-summary-bar card-glass">
          <div className="summary-stat-item">
            <span className="summary-label">Total Records Found</span>
            <span className="summary-val">{reportData.rows.length}</span>
          </div>
          {reportData.summary.activeUsers !== undefined && (
            <div className="summary-stat-item">
              <span className="summary-label">Active Users</span>
              <span className="summary-val text-success">{reportData.summary.activeUsers}</span>
            </div>
          )}
          {reportData.summary.bannedUsers !== undefined && (
            <div className="summary-stat-item">
              <span className="summary-label">Banned Users</span>
              <span className="summary-val text-danger">{reportData.summary.bannedUsers}</span>
            </div>
          )}
          {reportData.summary.averageRating !== undefined && (
            <div className="summary-stat-item">
              <span className="summary-label">Average Score</span>
              <span className="summary-val text-warning">{reportData.summary.averageRating} ★</span>
            </div>
          )}
          {reportData.summary.accepted !== undefined && (
            <div className="summary-stat-item">
              <span className="summary-label">Accepted Swaps</span>
              <span className="summary-val text-primary">{reportData.summary.accepted}</span>
            </div>
          )}
        </div>
      )}

      {/* Report Data Table */}
      <div className="admin-table-wrapper card-glass">
        {loading ? (
          <div className="admin-loading-state">
            <div className="spinner"></div>
            <p>Compiling report query...</p>
          </div>
        ) : reportData.rows.length === 0 ? (
          <div className="admin-empty-state">
            <FileSpreadsheet size={40} className="empty-icon" />
            <p>No records found matching the specified report parameters.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  {Object.keys(reportData.rows[0]).map((colKey) => (
                    <th key={colKey}>
                      {colKey.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportData.rows.map((row, idx) => (
                  <tr key={row.id || idx}>
                    {Object.keys(reportData.rows[0]).map((colKey) => (
                      <td key={colKey}>
                        {colKey === 'status' ? (
                          <Badge variant={row[colKey] === 'accepted' || row[colKey] === 'Active' ? 'success' : (row[colKey] === 'Banned' ? 'danger' : 'warning')}>
                            {row[colKey]}
                          </Badge>
                        ) : colKey.toLowerCase().includes('date') ? (
                          new Date(row[colKey]).toLocaleDateString()
                        ) : (
                          String(row[colKey] !== undefined ? row[colKey] : '')
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReports;

