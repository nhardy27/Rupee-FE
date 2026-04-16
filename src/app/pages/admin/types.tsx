// Types management page - CRUD operations for transaction types (Income/Expense)
import { useEffect, useState, useCallback } from 'react';
import { Layout } from '../../components/Layout';
import { Loader } from '../../components/Loader';
import config from '../../../config/global.json';
import { apiRequest } from '../../../utils/api';

// Category interface
interface Category {
  id: string;
  name: string;
}

// Type interface definition
interface Type {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  categories: Category[]; // Associated categories
}

// API response interface
interface TypesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Type[];
}

// Types management component
export function Types() {
  // State management
  const [types, setTypes] = useState<Type[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch types from API with optional search
  const fetchTypes = async (search = '') => {
    try {
      const url = search 
        ? `${config.api.host}${config.api.type}?search=${encodeURIComponent(search)}`
        : `${config.api.host}${config.api.type}`;
      const res = await apiRequest(url);
      const data: TypesResponse = await res.json();
      setTypes(data.results || []);
    } catch (error) {
      console.error('Failed to fetch types:', error);
      setTypes([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch types on component mount
  useEffect(() => {
    fetchTypes();
  }, []);

  // Handle form submission for create/update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editId ? `${config.api.host}${config.api.type}${editId}/` : `${config.api.host}${config.api.type}`;
    const method = editId ? 'PUT' : 'POST';
    
    try {
      await apiRequest(url, {
        method,
        body: JSON.stringify({ name })
      });
      // Reset form and refresh list
      setName('');
      setEditId(null);
      fetchTypes();
    } catch (error) {
      console.error('Failed to save type:', error);
    }
  };

  // Populate form with type data for editing
  const handleEdit = (type: Type) => {
    setName(type.name);
    setEditId(type.id);
  };

  // Handle type deletion
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    
    try {
      await apiRequest(`${config.api.host}${config.api.type}${id}/`, { method: 'DELETE' });
      fetchTypes(searchQuery);
    } catch (error) {
      console.error('Failed to delete type:', error);
    }
  };

  // Debounced search to avoid excessive API calls
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: number;
      return (query: string) => {
        setSearchQuery(query);
        clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => fetchTypes(query), 300);
      };
    })(),
    []
  );

  // Show loading state
  if (loading) {
    return (
      <Layout pageTitle="Types">
        <div className="flex items-center justify-center py-16">
          <Loader size={120} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Types" onSearch={debouncedSearch} searchPlaceholder="Search types...">
      {/* Create/Edit Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Type name"
            className="flex-1 px-3 py-2 border rounded text-sm"
            required
          />
          <div className="flex gap-2">
            <button type="submit" className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
              {editId ? 'Update' : 'Create'}
            </button>
            {/* Cancel button - only shown when editing */}
            {editId && (
              <button type="button" onClick={() => { setEditId(null); setName(''); }} className="flex-1 sm:flex-none px-4 py-2 bg-gray-500 text-white rounded text-sm">
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Types Table */}
      <div className="bg-white rounded-lg shadow">
        {/* Mobile Card View */}
        <div className="block sm:hidden">
          {types.map(type => (
            <div key={type.id} className="border-b p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-900">{type.name}</h3>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(type)} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                  <button onClick={() => handleDelete(type.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-1">
                Categories: {type.categories.length > 0 ? type.categories.map(c => c.name).join(', ') : 'None'}
              </p>
              <p className="text-xs text-gray-400">Created: {new Date(type.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categories</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {types.map(type => (
                <tr key={type.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{type.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {/* Display associated categories or "None" */}
                    {type.categories.length > 0 ? type.categories.map(c => c.name).join(', ') : 'None'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(type.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm">
                    <button onClick={() => handleEdit(type)} className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                    <button onClick={() => handleDelete(type.id)} className="text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
