// Dashboard page - displays overview statistics
import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Users } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { Loader } from '../components/Loader';
import config from '../../config/global.json';

// Dashboard component showing key statistics
export function Dashboard() {
  // State for dashboard statistics
  const [stats, setStats] = useState({
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch dashboard statistics on component mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        // Fetch users data
        const usersRes = await fetch(`${config.api.host}${config.api.user}`, { headers });
        const usersData = await usersRes.json();

        // Filter out superusers from total count
        const regularUsers = usersData.results ? usersData.results.filter(user => !user.is_superuser) : [];

        // Update stats state
        setStats({
          totalUsers: regularUsers.length
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <Layout pageTitle="Dashboard">
        <div className="flex items-center justify-center py-16">
          <Loader size={120} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Dashboard">
      {/* Statistics Grid */}
      <div className="grid grid-cols-1 gap-4 md:gap-6">
        {/* Total Users Card */}
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats.totalUsers.toLocaleString()}
          growth={0}
          iconColor="#374151"
          iconBgColor="#F3F4F6"
        />
      </div>
    </Layout>
  );
}