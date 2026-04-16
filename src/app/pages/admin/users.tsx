// Users management page - CRUD operations for users
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Layout } from '../../components/Layout';
import { Loader } from '../../components/Loader';
import config from '../../../config/global.json';
import { apiRequest } from '../../../utils/api';
import { Plus, Edit, Trash2, X, Eye, EyeOff, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';

// User interface definition
interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  contact_no: string;
  date_of_birth: string;
  groups: number[];
  is_active: boolean;
  is_superuser: boolean;
}

// API response interface
interface UsersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

// Users management component
export function Users() {
  const navigate = useNavigate();
  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 10;
  const [showPermanentDeleteModal, setShowPermanentDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    contact_no: '',
    date_of_birth: '',
    groups: [1],
    is_active: true
  });

  // Check if user is authenticated
  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return false;
    }
    return true;
  };

  // Fetch users from API with optional search and pagination
  const fetchUsers = async (search: string, page: number) => {
    if (!checkAuth()) return;
    
    try {
      setLoading(true);
      const params = new URLSearchParams({ 
        page: page.toString()
      });
      if (search) params.append('search', search);
      
      const url = `${config.api.host}${config.api.user}?${params.toString()}`;
      const res = await apiRequest(url);
      const data: UsersResponse = await res.json();
      
      // Filter out superusers from both results and count
      const filteredUsers = (data.results || []).filter(user => !user.is_superuser);
      
      setUsers(filteredUsers);
      
      // For total count, we need to get all users and filter them
      // This is a workaround since the API might not support is_superuser filter properly
      if (page === 1 && !search) {
        // Fetch all users to get accurate count (only on first page without search)
        try {
          const allUsersRes = await apiRequest(`${config.api.host}${config.api.user}?page_size=1000`);
          const allUsersData: UsersResponse = await allUsersRes.json();
          const allFilteredUsers = (allUsersData.results || []).filter(user => !user.is_superuser);
          setTotalCount(allFilteredUsers.length);
        } catch {
          // Fallback to filtered current page count if all users fetch fails
          setTotalCount(filteredUsers.length);
        }
      } else {
        // For other pages or search, estimate based on current results
        setTotalCount(Math.max(totalCount, (page - 1) * PAGE_SIZE + filteredUsers.length));
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('Failed to load users');
      setUsers([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users on component mount and when page/search changes
  useEffect(() => {
    fetchUsers(searchQuery, currentPage);
  }, [currentPage, searchQuery]);

  // Handle form submission for create/update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Check for duplicate email
    const emailExists = users.some(user => 
      user.email.toLowerCase() === formData.email.toLowerCase() && 
      (!editingUser || user.id !== editingUser.id)
    );
    
    if (emailExists) {
      setError('Email already exists. Please use a different email.');
      return;
    }
    
    // Validate contact number
    if (formData.contact_no.length !== 10) {
      setError('Contact number must be exactly 10 digits.');
      return;
    }
    
    try {
      const url = editingUser 
        ? `${config.api.host}${config.api.user}${editingUser.id}/`
        : `${config.api.host}${config.api.createUser}`;
      
      const method = editingUser ? 'PUT' : 'POST';
      // Remove password field when editing if empty, keep original date_of_birth if not changed
      const body = editingUser 
        ? { 
            ...formData, 
            ...(formData.password ? {} : { password: undefined }),
            date_of_birth: formData.date_of_birth || editingUser.date_of_birth
          }
        : formData;

      const res = await apiRequest(url, {
        method,
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(JSON.stringify(errorData));
        return;
      }

      // Close modal and refresh users list
      setShowModal(false);
      setEditingUser(null);
      resetForm();
      fetchUsers(searchQuery, currentPage);
    } catch (error) {
      console.error('Failed to save user:', error);
      setError('Failed to save user');
    }
  };

  // Handle user deletion (soft delete)
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await apiRequest(`${config.api.host}${config.api.user}${id}/`, {
        method: 'DELETE'
      });
      fetchUsers(searchQuery, currentPage);
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  // Handle permanent user deletion
  const handlePermanentDelete = async () => {
    if (!userToDelete) return;
    
    try {
      await apiRequest(`${config.api.host}${config.api.user}${userToDelete.id}/permanent-delete/`, {
        method: 'DELETE'
      });
      setShowPermanentDeleteModal(false);
      setUserToDelete(null);
      fetchUsers(searchQuery, currentPage);
    } catch (error) {
      console.error('Failed to permanently delete user:', error);
      setError('Failed to permanently delete user');
    }
  };

  // Open permanent delete confirmation modal
  const openPermanentDeleteModal = (user: User) => {
    setUserToDelete(user);
    setShowPermanentDeleteModal(true);
  };

  // Populate form with user data for editing
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      first_name: user.first_name,
      last_name: user.last_name,
      contact_no: user.contact_no,
      date_of_birth: user.date_of_birth,
      groups: user.groups,
      is_active: user.is_active
    });
    setShowModal(true);
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      contact_no: '',
      date_of_birth: '',
      groups: [1],
      is_active: true
    });
  };

  // Close modal and reset form
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setShowPassword(false);
    resetForm();
  };

  // Debounced search to avoid excessive API calls
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: number;
      return (query: string) => {
        clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
          setSearchQuery(query);
          setCurrentPage(1);
        }, 300);
      };
    })(),
    []
  );

  // Show loading state
  if (loading) {
    return (
      <Layout pageTitle="Users">
        <div className="flex items-center justify-center py-16">
          <Loader size={120} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Users" onSearch={debouncedSearch} searchPlaceholder="Search users...">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        {/* Header with Add User button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#374151] text-white rounded-lg hover:bg-[#4B5563]"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DOB</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {user.first_name} {user.last_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.contact_no}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.date_of_birth}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(user)} className="text-blue-600 hover:text-blue-800" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-800" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => openPermanentDeleteModal(user)} className="text-red-800 hover:text-red-900" title="Permanent Delete">
                        <AlertTriangle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination - Show if more than one page exists */}
        {Math.ceil(totalCount / PAGE_SIZE) > 1 && (
          <div className="flex items-center justify-between mt-6 px-6 py-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              Showing {Math.min((currentPage - 1) * PAGE_SIZE + 1, totalCount)} to {Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount} entries
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-4 py-2 bg-white border rounded-lg font-medium">
                {currentPage} of {Math.ceil(totalCount / PAGE_SIZE)}
              </span>
              <button
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage >= Math.ceil(totalCount / PAGE_SIZE)}
                className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Show total count info */}
        <div className="mt-4 text-sm text-gray-500 text-center">
          Total Users: {totalCount}
        </div>
      </div>

      {/* Permanent Delete Confirmation Modal */}
      {showPermanentDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowPermanentDeleteModal(false)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Permanent Delete User</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-3">
                Are you sure you want to permanently delete this user?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                <p className="text-sm text-red-800 font-medium">
                  {userToDelete?.first_name} {userToDelete?.last_name}
                </p>
                <p className="text-sm text-red-600">{userToDelete?.email}</p>
              </div>
              <p className="text-sm text-red-600 font-semibold">
                ⚠️ This action cannot be undone. All user data will be permanently removed.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handlePermanentDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Yes, Delete Permanently
              </button>
              <button
                onClick={() => {
                  setShowPermanentDeleteModal(false);
                  setUserToDelete(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleCloseModal}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{editingUser ? 'Edit User' : 'Add User'}</h3>
              <button onClick={handleCloseModal}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error display */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}
              
              {/* Email field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              
              {/* Password field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {editingUser && <span className="text-gray-500">(leave empty to keep current)</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border rounded-lg"
                    required={!editingUser}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              {/* Name fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>
              
              {/* Contact field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact No</label>
                <input
                  type="tel"
                  value={formData.contact_no}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                    if (value.length <= 10) {
                      setFormData({ ...formData, contact_no: value });
                    }
                  }}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="1234567890"
                  maxLength={10}
                  required
                />
                {formData.contact_no && formData.contact_no.length < 10 && (
                  <p className="text-red-500 text-xs mt-1">Contact number must be 10 digits</p>
                )}
              </div>
              
              {/* Date of Birth field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth {editingUser && <span className="text-gray-500">(leave empty to keep current)</span>}
                </label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required={!editingUser}
                />
              </div>
              
              {/* Active status field */}
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Active User</span>
                </label>
              </div>
              
              {/* Form action buttons */}
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#374151] text-white rounded-lg hover:bg-[#4B5563]"
                >
                  {editingUser ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
