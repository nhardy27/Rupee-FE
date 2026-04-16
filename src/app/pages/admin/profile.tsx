// Admin Profile page with CRUD functionality
import { useState, useEffect, FormEvent } from 'react';
import { Layout } from '../../components/Layout';
import { Loader } from '../../components/Loader';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { User, Edit, Save, X } from 'lucide-react';
import config from '../../../config/global.json';

interface AdminData {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_active: boolean;
  is_superuser: boolean;
  date_joined: string;
  last_login: string | null;
  contact_no: string | null;
  date_of_birth: string | null;
  groups: number[];
}

export function Profile() {
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form data for editing
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    confirmPassword: ''
  });

  // Helper function to decode JWT token and get user ID
  const getUserIdFromToken = (token: string): string | null => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.user_id || payload.sub || payload.id || null;
    } catch {
      return null;
    }
  };

  // Fetch admin profile data
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found');
        return;
      }

      // Get user ID from token
      const userId = getUserIdFromToken(token);
      
      if (!userId) {
        setError('Invalid token: Unable to get user ID');
        return;
      }

      // Fetch specific user data using the ID from token
      const response = await fetch(`${config.api.host}/api/v1/user/${userId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication failed. Please login again.');
          localStorage.removeItem('token');
          localStorage.removeItem('refresh');
          return;
        }
        throw new Error(`API Error ${response.status}`);
      }

      const userData = await response.json();
      
      setAdminData(userData);
      setFormData({
        username: userData.username || '',
        email: userData.email || '',
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        password: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error('Fetch profile error:', err);
      setError(`Failed to load profile data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Update admin profile
  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate passwords if provided
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!adminData?.id) {
      setError('User ID not found');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const updateData: any = {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name
      };

      // Only include password if provided
      if (formData.password) {
        updateData.password = formData.password;
      }

      // Use the specific user endpoint with ID
      const apiUrl = `${config.api.host}/api/v1/user/${adminData.id}/`;
      console.log('Update URL:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      console.log('Update response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Update error:', errorText);
        throw new Error(`Update failed: ${response.status}`);
      }

      const updatedData = await response.json();
      console.log('Update successful:', updatedData);
      
      setAdminData(updatedData);
      setIsEditing(false);
      setSuccess('Profile updated successfully');
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
    } catch (err) {
      console.error('Update profile error:', err);
      setError(`Failed to update profile: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleCancel = () => {
    if (adminData) {
      setFormData({
        username: adminData.username,
        email: adminData.email,
        first_name: adminData.first_name,
        last_name: adminData.last_name,
        password: '',
        confirmPassword: ''
      });
    }
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Layout pageTitle="Admin Profile">
        <div className="flex items-center justify-center py-16">
          <Loader size={120} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Admin Profile">
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#374151] rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Admin Profile</h1>
                <p className="text-gray-600">Manage your account information</p>
              </div>
            </div>
            
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-[#374151] hover:bg-[#4B5563]"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            )}
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
              {success}
            </div>
          )}

          {/* Profile Form */}
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  disabled={!isEditing}
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!isEditing}
                  required
                />
              </div>

              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  disabled={!isEditing}
                  required
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  disabled={!isEditing}
                  required
                />
              </div>
            </div>

            {/* Password Section - Only show when editing */}
            {isEditing && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Leave blank to keep current password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>
            )}



            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-3 pt-6 border-t">
                <Button
                  type="submit"
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
                
                <Button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </Layout>
  );
}