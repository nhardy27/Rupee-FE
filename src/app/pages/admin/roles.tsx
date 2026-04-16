// Roles management page - CRUD operations for roles and permissions
import { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { Loader } from '../../components/Loader';
import config from '../../../config/global.json';
import { apiRequest } from '../../../utils/api';
import { Plus, Edit, Trash2, X } from 'lucide-react';

// Permission interface definition
interface Permission {
  id: number;
  name: string;
}

// Role interface definition
interface Role {
  id: number;
  name: string;
  permissions: Permission[]; // Array of assigned permissions
}

// Roles management component
export function Roles() {
  // State management
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({ name: '', permissions: [] as number[] });

  // Fetch roles from API
  const fetchRoles = async () => {
    try {
      const res = await apiRequest(`${config.api.host}${config.api.role}`);
      const data = await res.json();
      console.log('Roles data:', data);
      setRoles(data.results || []);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all permissions with pagination support
  const fetchPermissions = async () => {
    try {
      let allPermissions: Permission[] = [];
      let url = `${config.api.host}${config.api.permission}`;
      
      // Loop through paginated results
      while (url) {
        const res = await apiRequest(url);
        const data = await res.json();
        allPermissions = [...allPermissions, ...(data.results || [])];
        url = data.next; // Get next page URL
      }
      
      setPermissions(allPermissions);
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  // Handle form submission for create/update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingRole
      ? `${config.api.host}${config.api.role}${editingRole.id}/`
      : `${config.api.host}${config.api.role}`;
    const method = editingRole ? 'PATCH' : 'POST';

    try {
      await apiRequest(url, {
        method,
        body: JSON.stringify(formData)
      });
      // Close modal and refresh list
      setShowModal(false);
      setEditingRole(null);
      setFormData({ name: '', permissions: [] });
      fetchRoles();
    } catch (error) {
      console.error('Failed to save role:', error);
    }
  };

  // Handle role deletion
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await apiRequest(`${config.api.host}${config.api.role}${id}/`, { method: 'DELETE' });
      fetchRoles();
    } catch (error) {
      console.error('Failed to delete role:', error);
    }
  };

  // Populate form with role data for editing
  const handleEdit = (role: Role) => {
    setEditingRole(role);
    console.log('Editing role:', role);
    // Extract permission IDs from role
    const permissionIds = Array.isArray(role.permissions) 
      ? role.permissions.map(p => typeof p === 'number' ? p : p.id).filter(Boolean)
      : [];
    console.log('Permission IDs:', permissionIds);
    setFormData({ name: role.name, permissions: permissionIds });
    setShowModal(true);
  };

  // Toggle permission selection in form
  const togglePermission = (permId: number) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(id => id !== permId) // Remove if already selected
        : [...prev.permissions, permId] // Add if not selected
    }));
  };

  // Show loading state
  if (loading) {
    return (
      <Layout pageTitle="Roles">
        <div className="flex items-center justify-center py-16">
          <Loader size={120} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Roles">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        {/* Header with Add Role button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Role Management</h2>
          <button
            onClick={() => {
              setEditingRole(null);
              setFormData({ name: '', permissions: [] });
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#374151] text-white rounded-lg hover:bg-[#4B5563]"
          >
            <Plus className="w-4 h-4" />
            Add Role
          </button>
        </div>

        {/* Roles Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permissions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {roles.map((role) => (
                <tr key={role.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{role.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {/* Display permission count */}
                    {Array.isArray(role.permissions) && role.permissions.length > 0
                      ? `${role.permissions.length} permissions assigned`
                      : 'No permissions assigned'
                    }
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button onClick={() => handleEdit(role)} className="text-blue-600 hover:text-blue-800 mr-3">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(role.id)} className="text-red-600 hover:text-red-800">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Role Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{editingRole ? 'Edit Role' : 'Add Role'}</h3>
              <button onClick={() => {
                setShowModal(false);
                setEditingRole(null);
                setFormData({ name: '', permissions: [] });
              }}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role name field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              {/* Permissions selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                  {permissions.map((perm) => (
                    <div key={perm.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`perm-${perm.id}`}
                        checked={formData.permissions.includes(perm.id)}
                        onChange={() => togglePermission(perm.id)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <label htmlFor={`perm-${perm.id}`} className="text-sm text-gray-700">
                        {perm.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form action buttons */}
              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#374151] text-white rounded-lg hover:bg-[#4B5563]"
                >
                  {editingRole ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
