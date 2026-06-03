
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = '/api/leads';
const statuses = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];
const sortOptions = [
  { value: '-createdDate', label: 'Newest' },
  { value: 'createdDate', label: 'Oldest' },
  { value: 'name', label: 'Name A–Z' },
  { value: '-name', label: 'Name Z–A' }
];

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sort, setSort] = useState('-createdDate');
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ total: 0, converted: 0, lost: 0, qualified: 0, contacted: 0 });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'New',
    notes: ''
  });
  const [message, setMessage] = useState('');

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/stats/summary`);
      setStats(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL, {
        params: {
          page,
          limit,
          status: statusFilter || undefined,
          sort
        }
      });
      setLeads(response.data.leads || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchStats();
  }, [page, statusFilter, sort]);

  const resetForm = () => {
    setEditingId(null);
    setForm({ name: '', email: '', phone: '', company: '', status: 'New', notes: '' });
    setMessage('');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name || !form.email || !form.phone || !form.company) {
      setMessage('Name, email, phone, and company are required.');
      return;
    }

    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, form);
        setMessage('Lead updated successfully.');
      } else {
        await axios.post(API_URL, form);
        setMessage('Lead added successfully.');
      }
      resetForm();
      fetchLeads();
      fetchStats();
    } catch (error) {
      console.error(error);
      setMessage('Unable to save lead. Please try again.');
    }
  };

  const handleEdit = (lead) => {
    setEditingId(lead._id);
    setForm({
      name: lead.name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      company: lead.company || '',
      status: lead.status || 'New',
      notes: lead.notes || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lead?')) {
      return;
    }
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchLeads();
      fetchStats();
      setMessage('Lead deleted.');
    } catch (error) {
      console.error(error);
      setMessage('Unable to delete lead.');
    }
  };

  const handleStatusChange = async (id, statusValue) => {
    try {
      await axios.put(`${API_URL}/${id}`, { status: statusValue });
      fetchLeads();
      fetchStats();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) {
      setPage(1);
      fetchLeads();
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/search`, { params: { q: search } });
      setLeads(response.data.leads || []);
      setTotal(response.data.total || 0);
      setPage(1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearch('');
    setPage(1);
    fetchLeads();
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Lead Management CRM</p>
          <h1>Small Business Lead Dashboard</h1>
          <p>Manage new leads, update statuses, track growth, and keep your sales pipeline moving.</p>
        </div>
      </header>

      <section className="stats-grid">
        <article className="stat-card">
          <h3>Total Leads</h3>
          <p>{stats.total || 0}</p>
        </article>
        <article className="stat-card">
          <h3>Contacted</h3>
          <p>{stats.contacted || 0}</p>
        </article>
        <article className="stat-card">
          <h3>Qualified</h3>
          <p>{stats.qualified || 0}</p>
        </article>
        <article className="stat-card">
          <h3>Converted</h3>
          <p>{stats.converted || 0}</p>
        </article>
        <article className="stat-card">
          <h3>Lost</h3>
          <p>{stats.lost || 0}</p>
        </article>
      </section>

      <section className="form-panel">
        <h2>{editingId ? 'Edit Lead' : 'Add New Lead'}</h2>
        <form onSubmit={handleSubmit} className="lead-form">
          <div className="form-grid">
            <label>
              Name*
              <input name="name" value={form.name} onChange={handleFormChange} required />
            </label>
            <label>
              Email*
              <input type="email" name="email" value={form.email} onChange={handleFormChange} required />
            </label>
            <label>
              Phone*
              <input name="phone" value={form.phone} onChange={handleFormChange} required />
            </label>
            <label>
              Company*
              <input name="company" value={form.company} onChange={handleFormChange} required />
            </label>
            <label>
              Status
              <select name="status" value={form.status} onChange={handleFormChange}>
                {statuses.map((statusOption) => (
                  <option key={statusOption} value={statusOption}>{statusOption}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Notes
            <textarea name="notes" value={form.notes} onChange={handleFormChange} rows="4" />
          </label>

          <div className="form-actions">
            <button type="submit" className="primary-button">{editingId ? 'Save Changes' : 'Create Lead'}</button>
            <button type="button" className="secondary-button" onClick={resetForm}>Clear</button>
          </div>
          {message && <div className="form-message">{message}</div>}
        </form>
      </section>

      <section className="controls-panel">
        <div className="control-row">
          <label>
            Search
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, email, company" />
          </label>
          <div className="action-group">
            <button type="button" onClick={handleSearch}>Search</button>
            <button type="button" onClick={handleClearSearch}>Reset</button>
          </div>
        </div>

        <div className="control-row wrap">
          <label>
            Status Filter
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              {statuses.map((statusOption) => (
                <option key={statusOption} value={statusOption}>{statusOption}</option>
              ))}
            </select>
          </label>
          <label>
            Sort by
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="table-panel">
        <div className="table-header">
          <h2>Leads</h2>
          <p>{loading ? 'Loading leads...' : `${total} lead${total === 1 ? '' : 's'} found`}</p>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Company</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 && (
                <tr>
                  <td colSpan="7">No leads available.</td>
                </tr>
              )}
              {leads.map((lead) => (
                <tr key={lead._id}>
                  <td>{lead.name}</td>
                  <td>{lead.email}</td>
                  <td>{lead.company}</td>
                  <td>{lead.phone}</td>
                  <td>
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                    >
                      {statuses.map((statusOption) => (
                        <option key={statusOption} value={statusOption}>{statusOption}</option>
                      ))}
                    </select>
                  </td>
                  <td>{new Date(lead.createdDate).toLocaleDateString()}</td>
                  <td className="action-buttons">
                    <button type="button" onClick={() => handleEdit(lead)}>Edit</button>
                    <button type="button" className="danger-button" onClick={() => handleDelete(lead._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination-bar">
          <button type="button" onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page === 1}>
            Previous
          </button>
          <span>Page {page} of {totalPages || 1}</span>
          <button type="button" onClick={() => setPage((prev) => Math.min(totalPages || 1, prev + 1))} disabled={page === totalPages || totalPages === 0}>
            Next
          </button>
        </div>
      </section>
    </div>
  );
}
