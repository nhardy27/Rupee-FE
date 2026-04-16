// AI Questions management page - CRUD operations for AI questions
import { useEffect, useState, useCallback } from 'react';
import { Layout } from '../../components/Layout';
import { Loader } from '../../components/Loader';
import config from '../../../config/global.json';
import { apiRequest } from '../../../utils/api';
import { Plus, Edit, Trash2, X, CheckSquare, Square, Power, ChevronLeft, ChevronRight } from 'lucide-react';

// AI Question interface definition
interface AIQuestion {
  id: string;
  question: string;
  category: string;
  response_template: string;
  logic_type?: string;
  is_active: boolean;
  is_dynamic: boolean;
  usage_count?: number;
  created_at: string;
  updated_at: string;
}

// AI Questions management component
export function AIQuestions() {
  // State management
  const [aiQuestions, setAIQuestions] = useState<AIQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<AIQuestion | null>(null);
  const [formData, setFormData] = useState({ question: '', category: '', response_template: '', logic_type: '', is_active: true, is_dynamic: true });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  // Fetch AI questions from API with optional search and pagination
  const fetchAIQuestions = async (search = '', page = 1) => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      params.append('page', page.toString());
      params.append('page_size', pageSize.toString());
      
      const url = `${config.api.host}${config.api.aiQuestion}?${params.toString()}`;
      const res = await apiRequest(url);
      const data = await res.json();
      setAIQuestions(data.results || []);
      setTotalCount(data.count || 0);
      setTotalPages(Math.ceil((data.count || 0) / pageSize));
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch AI questions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch AI questions on component mount
  useEffect(() => {
    fetchAIQuestions();
  }, []);

  // Handle form submission for create/update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    // Validation
    if (formData.is_dynamic && !formData.logic_type) {
      setError('Dynamic questions must have a logic type');
      setSubmitting(false);
      return;
    }

    const url = editingQuestion
      ? `${config.api.host}${config.api.aiQuestion}${editingQuestion.id}/`
      : `${config.api.host}${config.api.aiQuestionCreate}`;
    const method = editingQuestion ? 'PUT' : 'POST';

    try {
      const res = await apiRequest(url, {
        method,
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || errorData.detail || 'Failed to save question');
      }

      const data = await res.json();
      setShowModal(false);
      setEditingQuestion(null);
      setFormData({ question: '', category: '', response_template: '', logic_type: '', is_active: true, is_dynamic: true });
      setSelectedIds(new Set());
      fetchAIQuestions(searchQuery, currentPage);
    } catch (error: any) {
      setError(error.message || 'Failed to save AI question');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle AI question deletion
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await apiRequest(`${config.api.host}${config.api.aiQuestion}${id}/`, { method: 'DELETE' });
      fetchAIQuestions(searchQuery, currentPage);
    } catch (error) {
      console.error('Failed to delete AI question:', error);
    }
  };

  // Handle multiple delete
  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} items?`)) return;
    try {
      await Promise.all(
        Array.from(selectedIds).map(id => 
          apiRequest(`${config.api.host}${config.api.aiQuestion}${id}/`, { method: 'DELETE' })
        )
      );
      setSelectedIds(new Set());
      fetchAIQuestions(searchQuery, currentPage);
    } catch (error) {
      console.error('Failed to delete AI questions:', error);
    }
  };

  // Handle bulk activate/deactivate
  const handleBulkActivate = async (activate: boolean) => {
    try {
      await apiRequest(`${config.api.host}${config.api.aiQuestion}bulk_activate/`, {
        method: 'POST',
        body: JSON.stringify({ ids: Array.from(selectedIds), is_active: activate })
      });
      setSelectedIds(new Set());
      fetchAIQuestions(searchQuery, currentPage);
    } catch (error) {
      console.error('Failed to bulk activate/deactivate:', error);
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
      prev.size === aiQuestions.length ? new Set() : new Set(aiQuestions.map(q => q.id))
    );
  };

  // Populate form with AI question data for editing
  const handleEdit = (question: AIQuestion) => {
    setEditingQuestion(question);
    setFormData({ 
      question: question.question,
      category: question.category,
      response_template: question.response_template,
      logic_type: question.logic_type || '',
      is_active: question.is_active,
      is_dynamic: question.is_dynamic
    });
    setError('');
    setShowModal(true);
  };

  // Debounced search to avoid excessive API calls
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: number;
      return (query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);
        clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => fetchAIQuestions(query, 1), 300);
      };
    })(),
    []
  );

  // Show loading state
  if (loading) {
    return (
      <Layout pageTitle="AI Questions">
        <div className="flex items-center justify-center py-16">
          <Loader size={120} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="AI Questions" onSearch={debouncedSearch} searchPlaceholder="Search AI questions...">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        {/* Header with Add AI Question button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold text-gray-800">AI Questions Management</h2>
          <div className="flex gap-2 w-full sm:w-auto flex-wrap">
            {selectedIds.size > 0 && (
              <>
                <button onClick={() => handleBulkActivate(true)} className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <Power className="w-4 h-4" /> Activate ({selectedIds.size})
                </button>
                <button onClick={() => handleBulkActivate(false)} className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                  <Power className="w-4 h-4" /> Deactivate ({selectedIds.size})
                </button>
                <button onClick={handleBulkDelete} className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  <Trash2 className="w-4 h-4" /> Delete ({selectedIds.size})
                </button>
              </>
            )}
            <button 
              onClick={() => {
                setEditingQuestion(null);
                setFormData({ question: '', category: '', response_template: '', logic_type: '', is_active: true, is_dynamic: true });
                setError('');
                setShowModal(true);
              }} 
              className="flex items-center justify-center gap-2 px-4 py-2 bg-[#374151] text-white rounded-lg hover:bg-[#4B5563] flex-1 sm:flex-initial"
            >
              <Plus className="w-4 h-4" /> Add AI Question
            </button>
          </div>
        </div>

        {/* AI Questions Table */}
        {/* Mobile Card View */}
        <div className="block sm:hidden">
          {aiQuestions.map((question) => (
            <div key={question.id} className="border-b p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-start gap-2 flex-1">
                  <button onClick={() => toggleSelect(question.id)} className="mt-1">
                    {selectedIds.has(question.id) ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-gray-400" />}
                  </button>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{question.question}</h3>
                    <p className="text-sm text-gray-600 mt-1">{question.response_template.substring(0, 100)}...</p>
                  </div>
                </div>
                <div className="flex gap-2 ml-2">
                  <button onClick={() => handleEdit(question)} className="text-blue-600 hover:text-blue-800">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(question.id)} className="text-red-600 hover:text-red-800">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-1 ml-7 flex-wrap">
                <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">{question.category}</span>
                {question.logic_type && <span className="px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800">{question.logic_type}</span>}
                <span className={`px-2 py-1 rounded-full text-xs ${question.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {question.is_active ? 'Active' : 'Inactive'}
                </span>
                {question.is_dynamic && <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">Dynamic</span>}
              </div>
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
                    {selectedIds.size === aiQuestions.length && aiQuestions.length > 0 ? 
                      <CheckSquare className="w-5 h-5 text-blue-600" /> : 
                      <Square className="w-5 h-5 text-gray-400" />
                    }
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Question</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Logic Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Template</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {aiQuestions.map((question) => (
                <tr key={question.id}>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleSelect(question.id)}>
                      {selectedIds.has(question.id) ? 
                        <CheckSquare className="w-5 h-5 text-blue-600" /> : 
                        <Square className="w-5 h-5 text-gray-400" />
                      }
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">{question.question}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">{question.category}</span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {question.logic_type ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800">{question.logic_type}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">{question.response_template}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex flex-col gap-1">
                      <span className={`px-2 py-1 rounded-full text-xs ${question.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {question.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {question.is_dynamic && <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">Dynamic</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button onClick={() => handleEdit(question)} className="text-blue-600 hover:text-blue-800 mr-3">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(question.id)} className="text-red-600 hover:text-red-800">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchAIQuestions(searchQuery, currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => fetchAIQuestions(searchQuery, pageNum)}
                      className={`px-3 py-2 border rounded-lg ${
                        currentPage === pageNum
                          ? 'bg-[#374151] text-white'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => fetchAIQuestions(searchQuery, currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit AI Question Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{editingQuestion ? 'Edit AI Question' : 'Add AI Question'}</h3>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Question field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question *</label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="How much did I spend on food this month?"
                  minLength={10}
                  required
                />
              </div>

              {/* Category field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select category</option>
                  <option value="FINANCIAL">Financial</option>
                  <option value="BUDGETING">Budgeting</option>
                  <option value="INSIGHTS">Insights</option>
                  <option value="SPENDING">Spending</option>
                  <option value="ANALYSIS">Analysis</option>
                  <option value="TRENDS">Trends</option>
                  <option value="BUDGET">Budget</option>
                  <option value="PATTERNS">Patterns</option>
                  <option value="TIPS">Tips</option>
                </select>
              </div>

              {/* Logic Type field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logic Type {formData.is_dynamic && <span className="text-red-500">*</span>}
                </label>
                <select
                  value={formData.logic_type}
                  onChange={(e) => setFormData({ ...formData, logic_type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={formData.is_dynamic}
                >
                  <option value="">Select logic type</option>
                  <option value="spending_summary">Spending Summary</option>
                  <option value="category_analysis">Category Analysis</option>
                  <option value="trend_analysis">Trend Analysis</option>
                  <option value="budget_analysis">Budget Analysis</option>
                  <option value="weekly_summary">Weekly Summary</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Required for dynamic questions</p>
              </div>

              {/* Response Template field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Response Template *</label>
                <textarea
                  value={formData.response_template}
                  onChange={(e) => setFormData({ ...formData, response_template: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="You spent ₹{total} in total. {category_data}\n\nYour highest spending was {top_category} with ₹{top_amount}. {advice}"
                  rows={6}
                  minLength={10}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Use placeholders: {'{total}'}, {'{category_data}'}, {'{top_category}'}, {'{top_amount}'}, {'{advice}'}, {'{daily_avg}'}, {'{trend}'}, {'{percentage_change}'}</p>
              </div>

              {/* Active and Dynamic status checkboxes */}
              <div className="flex gap-4">
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
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_dynamic"
                    checked={formData.is_dynamic}
                    onChange={(e) => setFormData({ ...formData, is_dynamic: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <label htmlFor="is_dynamic" className="text-sm font-medium text-gray-700">Dynamic (Processes user data)</label>
                </div>
              </div>

              {/* Form action buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#374151] text-white rounded-lg hover:bg-[#4B5563] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Saving...' : editingQuestion ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50"
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
