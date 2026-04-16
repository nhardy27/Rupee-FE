import { useState, useEffect, useCallback } from 'react';
import { Layout } from '../../components/Layout';
import { Filter, Eye, Calendar, User, Activity, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Trash2 } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import config from '../../../config/global.json';

interface AuditLog {
  id: number;
  user_name: string;
  action: string;
  action_display: string;
  module: string;
  object_id: string;
  changes?: {
    old?: any;
    new?: any;
  };
  changes_summary?: {
    changed_fields?: string[];
    field_count?: number;
    action?: string;
  };
  timestamp?: string;
  formatted_timestamp: string;
}

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AuditLog[];
}



export function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [pageSize, setPageSize] = useState(20);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [excludeAdmin, setExcludeAdmin] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteDays, setDeleteDays] = useState(30);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [logToDelete, setLogToDelete] = useState<number | null>(null);

  const actions = ['CREATE', 'UPDATE', 'DELETE'];
  const modules = ['Category', 'Transaction', 'PaymentMethod', 'Type', 'Budget', 'SavingsGoals', 'RecurringTransaction'];

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/';
      return false;
    }
    return true;
  };

  const fetchLogs = useCallback(async (page = 1) => {
    if (!checkAuth()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = `${config.api.host}${config.api.auditLog}?page=${page}`;
      
      if (debouncedSearchTerm) url += `&search=${encodeURIComponent(debouncedSearchTerm)}`;
      if (selectedAction) url += `&action=${selectedAction}`;
      if (selectedModule) url += `&module=${selectedModule}`;
      if (excludeAdmin) url += `&hide_admin=true`;

      console.log('Fetching URL:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch audit logs');
      }

      const data: ApiResponse = await response.json();
      console.log('API Response:', { count: data.count, resultsLength: data.results.length, page, next: data.next, previous: data.previous });
      
      // Dynamically set page size based on API response
      if (data.results.length > 0 && page === 1) {
        setPageSize(data.results.length);
      }
      
      setLogs(data.results);
      setTotalCount(data.count);
      setHasNext(!!data.next);
      setHasPrevious(!!data.previous);
      setError('');
    } catch (err) {
      setError('Failed to load audit logs');
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, selectedAction, selectedModule, excludeAdmin]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedAction, selectedModule, excludeAdmin]);

  // Fetch logs when page or filters change
  useEffect(() => {
    fetchLogs(currentPage);
  }, [fetchLogs, currentPage]);



  const bulkDeleteAdminLogs = async () => {
    if (!checkAuth()) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.api.host}${config.api.auditLog}cleanup/?days=${deleteDays}&dry_run=false`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete logs');
      }
      
      setToast({ message: `Successfully deleted logs older than ${deleteDays} days`, type: 'success' });
      setShowDeleteModal(false);
      fetchLogs(currentPage);
    } catch (err) {
      setToast({ message: 'Failed to delete logs', type: 'error' });
      console.error('Error deleting logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteLog = async (id: number) => {
    if (!checkAuth()) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.api.host}${config.api.auditLog}${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete log');
      }
      
      setToast({ message: 'Log deleted successfully', type: 'success' });
      setShowDeleteConfirm(false);
      setLogToDelete(null);
      fetchLogs(currentPage);
    } catch (err) {
      setToast({ message: 'Failed to delete log', type: 'error' });
      console.error('Error deleting log:', err);
    } finally {
      setLoading(false);
    }
  };



  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'text-green-600 bg-green-50';
      case 'UPDATE': return 'text-blue-600 bg-blue-50';
      case 'DELETE': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const viewDetails = async (log: AuditLog) => {
    if (!checkAuth()) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.api.host}${config.api.auditLog}${log.id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch audit log details');
      }

      const detailData = await response.json();
      console.log('Detail API Response:', detailData);
      
      setSelectedLog(detailData);
      setShowModal(true);
    } catch (err) {
      setToast({ message: 'Failed to load audit log details', type: 'error' });
      console.error('Error fetching log details:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);
  
  console.log('Pagination Debug:', { totalCount, pageSize, totalPages, currentPage }); // Debug pagination

  const getPageNumbers = () => {
    if (totalPages <= 1) return [1];
    
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
      return range;
    }

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots.filter((item, index, arr) => arr.indexOf(item) === index);
  };

  return (
    <Layout 
      pageTitle="Audit Logs" 
      onSearch={setSearchTerm}
      searchPlaceholder="Search by user, module..."
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-[#111827]">Audit Logs</h1>
            <p className="text-[#6B7280] mt-1">Track all system activities and changes</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Old Logs</span>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Action Filter */}
            <div>
              <Label htmlFor="action" className="text-sm font-medium text-[#374151] mb-2 block">Action</Label>
              <select
                id="action"
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="w-full h-10 px-3 py-2 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#374151] focus:border-[#374151] bg-white"
              >
                <option value="">All Actions</option>
                {actions.map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </div>

            {/* Module Filter */}
            <div>
              <Label htmlFor="module" className="text-sm font-medium text-[#374151] mb-2 block">Module</Label>
              <select
                id="module"
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="w-full h-10 px-3 py-2 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#374151] focus:border-[#374151] bg-white"
              >
                <option value="">All Modules</option>
                {modules.map(module => (
                  <option key={module} value={module}>{module}</option>
                ))}
              </select>
            </div>

            {/* Hide Admin Logs Toggle */}
            <div>
              <Label className="text-sm font-medium text-[#374151] mb-2 block">Options</Label>
              <div className="flex items-center space-x-2 h-10">
                <input
                  type="checkbox"
                  id="excludeAdmin"
                  checked={excludeAdmin}
                  onChange={(e) => setExcludeAdmin(e.target.checked)}
                  className="w-4 h-4 text-[#374151] bg-gray-100 border-gray-300 rounded focus:ring-[#374151] focus:ring-2"
                />
                <Label htmlFor="excludeAdmin" className="text-sm text-[#374151] cursor-pointer">
                  Hide Admin Logs
                </Label>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#374151]"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="mx-auto h-12 w-12 text-[#6B7280] mb-4" />
              <p className="text-[#6B7280]">No audit logs found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                        Module
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                        Object ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#E5E7EB]">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#F9FAFB]">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="w-4 h-4 text-[#6B7280] mr-2" />
                            <span className="text-sm font-medium text-[#111827]">
                              {log.user_name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(log.action)}`}>
                            {log.action_display || log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#111827]">
                          {log.module}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6B7280]">
                          {log.object_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-[#6B7280]">
                            <Calendar className="w-4 h-4 mr-1" />
                            {log.formatted_timestamp || formatTimestamp(log.timestamp)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              onClick={() => viewDetails(log)}
                              className="text-[#374151] hover:text-[#111827] bg-transparent hover:bg-[#F3F4F6] p-2"
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => {
                                setLogToDelete(log.id);
                                setShowDeleteConfirm(true);
                              }}
                              className="text-red-600 hover:text-red-800 bg-transparent hover:bg-red-50 p-2"
                              title="Delete log"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Enhanced Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-[#E5E7EB]">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-[#6B7280]">
                      Showing {logs.length > 0 ? ((currentPage - 1) * pageSize) + 1 : 0} to {((currentPage - 1) * pageSize) + logs.length} of {totalCount} results
                      <span className="ml-2 text-xs text-[#9CA3AF]">(Page {currentPage} of {totalPages})</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {/* First Page */}
                      <Button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="p-2 text-[#374151] hover:bg-[#F3F4F6] disabled:opacity-50 disabled:cursor-not-allowed bg-transparent border-0"
                        title="First page"
                      >
                        <ChevronsLeft className="w-4 h-4" />
                      </Button>
                      
                      {/* Previous Page */}
                      <Button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={!hasPrevious}
                        className="p-2 text-[#374151] hover:bg-[#F3F4F6] disabled:opacity-50 disabled:cursor-not-allowed bg-transparent border-0"
                        title="Previous page"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>

                      {/* Page Numbers */}
                      <div className="flex items-center space-x-1">
                        {getPageNumbers().map((pageNum, index) => (
                          pageNum === '...' ? (
                            <span key={`dots-${index}`} className="px-3 py-2 text-[#6B7280]">
                              ...
                            </span>
                          ) : (
                            <Button
                              key={pageNum}
                              onClick={() => setCurrentPage(Number(pageNum))}
                              className={`px-3 py-2 text-sm min-w-[40px] ${
                                currentPage === pageNum
                                  ? 'bg-[#374151] text-white hover:bg-[#4B5563]'
                                  : 'bg-white border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]'
                              }`}
                            >
                              {pageNum}
                            </Button>
                          )
                        ))}
                      </div>

                      {/* Next Page */}
                      <Button
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={!hasNext}
                        className="p-2 text-[#374151] hover:bg-[#F3F4F6] disabled:opacity-50 disabled:cursor-not-allowed bg-transparent border-0"
                        title="Next page"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                      
                      {/* Last Page */}
                      <Button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={!hasNext}
                        className="p-2 text-[#374151] hover:bg-[#F3F4F6] disabled:opacity-50 disabled:cursor-not-allowed bg-transparent border-0"
                        title="Last page"
                      >
                        <ChevronsRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Enhanced Details Modal */}
      {showModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB]">
              <h3 className="text-xl font-semibold text-[#111827]">Audit Log Details</h3>
              <Button
                onClick={() => setShowModal(false)}
                className="text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] bg-transparent p-2 rounded-lg transition-colors"
              >
                ✕
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-[#6B7280]">User</Label>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-[#6B7280]" />
                      <p className="text-[#111827] font-medium">{selectedLog.user_name}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-[#6B7280]">Action</Label>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getActionColor(selectedLog.action)}`}>
                      {selectedLog.action}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-[#6B7280]">Module</Label>
                    <p className="text-[#111827] font-medium">{selectedLog.module}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-[#6B7280]">Object ID</Label>
                    <p className="text-[#111827] font-mono text-sm bg-[#F3F4F6] px-2 py-1 rounded">{selectedLog.object_id}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-[#6B7280]">Timestamp</Label>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-[#6B7280]" />
                      <p className="text-[#111827]">{selectedLog.formatted_timestamp || formatTimestamp(selectedLog.timestamp)}</p>
                    </div>
                  </div>
                </div>

                {selectedLog.changes && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-[#6B7280]">Changes</Label>
                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4">
                      <pre className="text-sm text-[#111827] whitespace-pre-wrap overflow-x-auto font-mono leading-relaxed">
                        {JSON.stringify(selectedLog.changes, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Single Delete Confirmation Modal */}
      {showDeleteConfirm && logToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB]">
              <h3 className="text-xl font-semibold text-[#111827]">Delete Audit Log</h3>
              <Button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setLogToDelete(null);
                }}
                className="text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] bg-transparent p-2 rounded-lg transition-colors"
              >
                ✕
              </Button>
            </div>
            
            <div className="p-6">
              <p className="text-[#6B7280] mb-6">
                Are you sure you want to delete this audit log? This action cannot be undone.
              </p>
              
              <div className="flex items-center justify-end space-x-3">
                <Button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setLogToDelete(null);
                  }}
                  className="px-4 py-2 bg-white border border-[#E5E7EB] text-[#374151] rounded-lg hover:bg-[#F9FAFB] transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => deleteLog(logToDelete)}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  <span>Delete</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB]">
              <h3 className="text-xl font-semibold text-[#111827]">Delete Old Logs</h3>
              <Button
                onClick={() => setShowDeleteModal(false)}
                className="text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] bg-transparent p-2 rounded-lg transition-colors"
              >
                ✕
              </Button>
            </div>
            
            <div className="p-6">
              <p className="text-[#6B7280] mb-4">
                This will permanently delete all audit logs (admin and user) older than the selected number of days. This action cannot be undone.
              </p>
              
              <div className="mb-6">
                <Label htmlFor="deleteDays" className="text-sm font-medium text-[#374151] mb-2 block">
                  Delete logs older than:
                </Label>
                <select
                  id="deleteDays"
                  value={deleteDays}
                  onChange={(e) => setDeleteDays(Number(e.target.value))}
                  className="w-full h-10 px-3 py-2 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#374151] focus:border-[#374151] bg-white"
                >
                  <option value={0}>All logs (Delete everything)</option>
                  <option value={1}>1 day</option>
                  <option value={7}>7 days</option>
                  <option value={30}>30 days</option>
                  <option value={90}>90 days</option>
                  <option value={180}>180 days (6 months)</option>
                  <option value={365}>365 days (1 year)</option>
                </select>
              </div>
              
              <div className="flex items-center justify-end space-x-3">
                <Button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-white border border-[#E5E7EB] text-[#374151] rounded-lg hover:bg-[#F9FAFB] transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  onClick={bulkDeleteAdminLogs}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  <span>Delete Logs</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}