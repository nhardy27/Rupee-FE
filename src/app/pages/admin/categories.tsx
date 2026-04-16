// Categories management page - CRUD operations for transaction categories
import { useEffect, useState, useCallback } from 'react';
import { Layout } from '../../components/Layout';
import { Loader } from '../../components/Loader';
import config from '../../../config/global.json';
import { apiRequest } from '../../../utils/api';
import { Plus, Edit, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';

// Type interface definition
interface Type {
  id: string;
  name: string;
}

// Category interface definition
interface Category {
  id: string;
  name: string;
  type: string | Type; // Can be either type ID or type object
  material_icon?: string; // Material icon name
  created_at: string;
}

// API response interface
interface CategoriesResponse {
  count: number;
  results: Category[];
}

// Categories management component
export function Categories() {
  // State management
  const [categories, setCategories] = useState<Category[]>([]);
  const [types, setTypes] = useState<Type[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', type: '', material_icon: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState('');
  const PAGE_SIZE = 10;

  // Fetch categories from API with optional search
  const fetchCategories = async (search: string, page: number) => {
    try {
      const url = search 
        ? `${config.api.host}${config.api.category}?search=${encodeURIComponent(search)}&page=${page}`
        : `${config.api.host}${config.api.category}?page=${page}`;
      console.log('Fetching:', url, 'Page:', page);
      const res = await apiRequest(url);
      const data: CategoriesResponse = await res.json();
      console.log('Response:', data);
      setCategories(data.results || []);
      setTotalCount(data.count || 0);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available types for dropdown
  const fetchTypes = async () => {
    try {
      const res = await apiRequest(`${config.api.host}${config.api.type}`);
      const data = await res.json();
      setTypes(data.results || []);
    } catch (error) {
      console.error('Failed to fetch types:', error);
    }
  };

  // Fetch data on component mount and when page/search changes
  useEffect(() => {
    setLoading(true);
    fetchCategories(searchQuery, currentPage);
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchTypes();
  }, []);

  // Handle form submission for create/update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const url = editingCategory
      ? `${config.api.host}${config.api.category}${editingCategory.id}/`
      : `${config.api.host}${config.api.category}`;
    const method = editingCategory ? 'PUT' : 'POST';

    try {
      const res = await apiRequest(url, {
        method,
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const errorData = await res.json();
        const errorMsg = errorData.non_field_errors?.[0] || errorData.name?.[0] || 'Failed to save category';
        setError(errorMsg);
        return;
      }
      setShowModal(false);
      setEditingCategory(null);
      setFormData({ name: '', type: '', material_icon: '' });
      fetchCategories(searchQuery, currentPage);
    } catch (error) {
      console.error('Failed to save category:', error);
      setError('Failed to save category');
    }
  };

  // Handle category deletion
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await apiRequest(`${config.api.host}${config.api.category}${id}/`, { method: 'DELETE' });
      fetchCategories(searchQuery, currentPage);
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  // Get type name from type ID or object
  const getTypeName = (typeId: string | Type) => {
    if (typeof typeId === 'object') return typeId.name;
    const type = types.find(t => t.id === typeId);
    return type?.name || 'N/A';
  };

  // Populate form with category data for editing
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    const typeId = typeof category.type === 'object' ? category.type.id : category.type;
    setFormData({ name: category.name, type: typeId, material_icon: category.material_icon || '' });
    setShowModal(true);
  };

  // Optimized debounced search
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: number;
      return (query: string) => {
        clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
          setSearchQuery(query);
          setCurrentPage(1);
        }, 500);
      };
    })(),
    []
  );

  // Show loading state
  if (loading) {
    return (
      <Layout pageTitle="Categories">
        <div className="flex items-center justify-center py-16">
          <Loader size={120} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Categories" onSearch={debouncedSearch} searchPlaceholder="Search categories...">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        {/* Header with Add Category button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold text-gray-800">Category Management</h2>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#374151] text-white rounded-lg hover:bg-[#4B5563] w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>

        {/* Categories Table */}
        {/* Mobile Card View */}
        <div className="block sm:hidden">
          {categories.length > 0 ? (
            categories.map((category) => (
              <div key={category.id} className="border-b p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {category.material_icon && (
                      <span className="material-icons text-gray-600 text-lg">{category.material_icon}</span>
                    )}
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(category)} className="text-blue-600 hover:text-blue-800">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(category.id)} className="text-red-600 hover:text-red-800">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-1">Type: {getTypeName(category.type)}</p>
                <p className="text-xs text-gray-400">Created: {new Date(category.created_at).toLocaleDateString()}</p>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              No data found
            </div>
          )}
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <tr key={category.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        {category.material_icon && (
                          <span className="material-icons text-gray-600 text-lg">{category.material_icon}</span>
                        )}
                        {category.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{getTypeName(category.type)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(category.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm">
                      <button onClick={() => handleEdit(category)} className="text-blue-600 hover:text-blue-800 mr-3">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(category.id)} className="text-red-600 hover:text-red-800">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalCount > PAGE_SIZE && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-4 px-6 gap-4">
            <div className="text-sm text-gray-500 order-2 sm:order-1">
              Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount} entries
            </div>
            <div className="flex gap-2 order-1 sm:order-2">
              <button
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-4 py-1 border rounded-lg bg-gray-50">
                {currentPage} / {Math.ceil(totalCount / PAGE_SIZE)}
              </span>
              <button
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage >= Math.ceil(totalCount / PAGE_SIZE)}
                className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Category Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{editingCategory ? 'Edit Category' : 'Add Category'}</h3>
              <button onClick={() => { setShowModal(false); setError(''); }}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}
              {/* Category name field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              {/* Type dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">Select Type</option>
                  {types.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Material Icon field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Material Icon</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.material_icon}
                    onChange={(e) => setFormData({ ...formData, material_icon: e.target.value })}
                    className="flex-1 px-3 py-2 border rounded-lg"
                    placeholder="e.g., home, shopping_cart, account_balance"
                  />
                  {formData.material_icon && (
                    <span className="material-icons text-gray-600 text-xl p-2 border rounded-lg bg-gray-50">
                      {formData.material_icon}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Enter a Material Icon name.
                </p>
              </div>

              {/* Form action buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#374151] text-white rounded-lg hover:bg-[#4B5563]"
                >
                  {editingCategory ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
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
