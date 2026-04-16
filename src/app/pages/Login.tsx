// Login page component - handles admin authentication
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { IndianRupee } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Loader } from '../components/Loader';
import config from '../../config/global.json';

export function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // STEP 1: Login and get JWT token
      const tokenRes = await fetch(`${config.api.host}${config.api.token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      if (!tokenRes.ok) {
        const errorData = await tokenRes.json().catch(() => ({}));
        setError(errorData.detail || "Invalid username or password");
        return;
      }

      const tokenData = await tokenRes.json();

      // STEP 2: Check user type
      const userRes = await fetch(`${config.api.host}${config.api.isSuperUser}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${tokenData.access}`
        }
      });

      if (!userRes.ok) {
        setError("Failed to verify user");
        return;
      }

      const userData = await userRes.json();

      // STEP 3: Allow only admin
      if (userData.user_type === "superuser") {
        localStorage.setItem("token", tokenData.access);
        localStorage.setItem("refresh", tokenData.refresh);
        navigate("/dashboard");
      } else {
        setError("Access Denied. Only Admin can login.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-[380px] bg-white rounded-2xl shadow-[0_6px_20px_rgba(0,0,0,0.05)] p-8">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-[#374151] rounded-xl flex items-center justify-center">
            <IndianRupee className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-semibold text-[#111827]">
            PaisaTrack
          </span>
        </div>

        <h2 className="text-center text-xl font-semibold text-[#111827] mb-6">
          Admin Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-5">

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>

            <Input
              id="username"
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#374151] text-white py-2.5 rounded-lg hover:bg-[#4B5563] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={20} />
                <span>Logging in...</span>
              </>
            ) : (
              'Login'
            )}
          </Button>

          <p className="text-center text-xs text-[#9CA3AF] mt-4">
            Secure Admin Access
          </p>

        </form>
      </div>
    </div>
  );
}