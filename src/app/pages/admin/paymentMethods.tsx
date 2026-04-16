// Payment Methods management page - CRUD operations for payment methods
import { useEffect, useState, useCallback } from 'react';
import { Layout } from '../../components/Layout';
import { Loader } from '../../components/Loader';
import config from '../../../config/global.json';
import { apiRequest } from '../../../utils/api';
import { Plus, Edit, Trash2, X, CheckSquare, Square } from 'lucide-react';

// Payment method interface definition
interface PaymentMethod {
  id: string;
  payment_method: string;
  is_active: boolean;
  created_at: string;
}

// Payment methods management component
export function PaymentMethods() {
  // State management
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState({ payment_method: '', is_active: true });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Fetch payment methods from API with optional search
  const fetchPaymentMethods = async (search = '') => {
    try {
      const url = search 
        ? `${config.api.host}${config.api.paymentMethod}?search=${encodeURIComponent(search)}`
        : `${config.api.host}${config.api.paymentMethod}`;
      const res = await apiRequest(url);
      const data = await res.json();
      setPaymentMethods(data.results || []);
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch payment methods on component mount
  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  // Handle form submission for create/update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingMethod
      ? `${config.api.host}${config.api.paymentMethod}${editingMethod.id}/`
      : `${config.api.host}${config.api.paymentMethod}`;
    const method = editingMethod ? 'PUT' : 'POST';

    try {
      await apiRequest(url, {
        method,
        body: JSON.stringify(formData)
      });
      // Close modal and refresh list
      setShowModal(false);
      setEditingMethod(null);
      setFormData({ payment_method: '', is_active: true });
      fetchPaymentMethods(searchQuery);
    } catch (error) {
      console.error('Failed to save payment method:', error);
    }
  };

  // Handle payment method deletion
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await apiRequest(`${config.api.host}${config.api.paymentMethod}${id}/`, { method: 'DELETE' });
      fetchPaymentMethods(searchQuery);
    } catch (error) {
      console.error('Failed to delete payment method:', error);
    }
  };

  // Handle multiple delete
  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} items?`)) return;
    try {
      await Promise.all(
        Array.from(selectedIds).map(id => 
          apiRequest(`${config.api.host}${config.api.paymentMethod}${id}/`, { method: 'DELETE' })
        )
      );
      setSelectedIds(new Set());
      fetchPaymentMethods(searchQuery);
    } catch (error) {
      console.error('Failed to delete payment methods:', error);
    }
  };

  // Toggle selection
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Toggle select all
  const toggleSelectAll = () => {
    setSelectedIds(prev => 
      prev.size === paymentMethods.length ? new Set() : new Set(paymentMethods.map(m => m.id))
    );
  };

  // Populate form with payment method data for editing
  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({ payment_method: method.payment_method, is_active: method.is_active });
    setShowModal(true);
  };

  // Debounced search to avoid excessive API calls
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: number;
      return (query: string) => {
        setSearchQuery(query);
        clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => fetchPaymentMethods(query), 300);
      };
    })(),
    []
  );

  // Show loading state
  if (loading) {
    return (
      <Layout pageTitle="Payment Methods">
        <div className="flex items-center justify-center py-16">
          <Loader size={120} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Payment Methods" onSearch={debouncedSearch} searchPlaceholder="Search payment methods...">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        {/* Header with Add Payment Method button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold text-gray-800">Payment Method Management</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            {selectedIds.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
                Delete ({selectedIds.size})
              </button>
            )}
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-[#374151] text-white rounded-lg hover:bg-[#4B5563] flex-1 sm:flex-initial"
            >
              <Plus className="w-4 h-4" />
              Add Payment Method
            </button>
          </div>
        </div>

        {/* Payment Methods Table */}
        {/* Mobile Card View */}
        <div className="block sm:hidden">
          {paymentMethods.map((method) => (
            <div key={method.id} className="border-b p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-start gap-2">
                  <button onClick={() => toggleSelect(method.id)} className="mt-1">
                    {selectedIds.has(method.id) ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-gray-400" />}
                  </button>
                  <h3 className="font-medium text-gray-900">{method.payment_method}</h3>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(method)} className="text-blue-600 hover:text-blue-800">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(method.id)} className="text-red-600 hover:text-red-800">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-1 ml-7">
                <span className={`px-2 py-1 rounded-full text-xs ${method.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {method.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-xs text-gray-400 ml-7">Created: {new Date(method.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left">
                  <button onClick={toggleSelectAll}>
                    {selectedIds.size === paymentMethods.length && paymentMethods.length > 0 ? 
                      <CheckSquare className="w-5 h-5 text-blue-600" /> : 
                      <Square className="w-5 h-5 text-gray-400" />
                    }
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paymentMethods.map((method) => (
                <tr key={method.id}>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleSelect(method.id)}>
                      {selectedIds.has(method.id) ? 
                        <CheckSquare className="w-5 h-5 text-blue-600" /> : 
                        <Square className="w-5 h-5 text-gray-400" />
                      }
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{method.payment_method}</td>
                  <td className="px-6 py-4 text-sm">
                    {/* Status badge */}
                    <span className={`px-2 py-1 rounded-full text-xs ${method.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {method.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(method.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm">
                    <button onClick={() => handleEdit(method)} className="text-blue-600 hover:text-blue-800 mr-3">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(method.id)} className="text-red-600 hover:text-red-800">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Payment Method Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}</h3>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Payment method name field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <input
                  type="text"
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Card, Cash, UPI, etc."
                  required
                />
              </div>

              {/* Active status checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Active</label>
              </div>

              {/* Form action buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#374151] text-white rounded-lg hover:bg-[#4B5563]"
                >
                  {editingMethod ? 'Update' : 'Create'}
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
