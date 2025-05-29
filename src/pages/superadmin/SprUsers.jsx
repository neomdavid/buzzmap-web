import { UsersTable } from "../../components";
import { useState, useEffect } from "react";
import { User, CheckCircle, XCircle, Clock } from "phosphor-react";
import { useGetUsersQuery } from "../../api/dengueApi";
import { Link } from "react-router-dom";

function SprUsers() {
  // Add the users query
  const { data: users, isLoading, error } = useGetUsersQuery();
  
  // Add console.log to debug the response
  console.log('Users API Response:', users);
  console.log('Loading state:', isLoading);
  console.log('Error state:', error);

  // Add statistics states
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    bannedUsers: 0,
    unverifiedUsers: 0,
    lastUpdated: new Date()
  });

  // Update stats when users data changes
  useEffect(() => {
    if (users) {
      setStats({
        totalUsers: users.length,
        activeUsers: users.filter(user => user.status === 'active').length,
        bannedUsers: users.filter(user => user.status === 'banned').length,
        unverifiedUsers: users.filter(user => user.status === 'unverified').length,
        lastUpdated: new Date()
      });
    }
  }, [users]);

  // Add filter states
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <main className="flex flex-col w-full">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </div>
            <div className="bg-primary/10 p-3 rounded-lg">
              <User size={24} className="text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Users</p>
              <p className="text-2xl font-bold text-success">{stats.activeUsers}</p>
            </div>
            <div className="bg-success/10 p-3 rounded-lg">
              <CheckCircle size={24} className="text-success" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Banned Users</p>
              <p className="text-2xl font-bold text-error">{stats.bannedUsers}</p>
            </div>
            <div className="bg-error/10 p-3 rounded-lg">
              <XCircle size={24} className="text-error" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Unverified Users</p>
              <p className="text-2xl font-bold text-warning">{stats.unverifiedUsers}</p>
            </div>
            <div className="bg-warning/10 p-3 rounded-lg">
              <Clock size={24} className="text-warning" />
            </div>
          </div>
        </div>
      </div>

     

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 mt-6">
        <p className="flex justify-center text-5xl font-extrabold mb-12 md:mb-0 text-center md:justify-start md:text-left md:w-[48%]">
          User Management
        </p>
        <Link to="/superadmin/users/archives" className="btn btn-outline rounded-full">
          View Archives
        </Link>
      </div>

       {/* Filters Section */}
       <div className="bg-white p-4 rounded-xl shadow-sm mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by username or email..."
                className="input input-bordered w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <select 
                className="select select-bordered w-full max-w-xs"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="banned">Banned</option>
                <option value="unverified">Unverified</option>
              </select>

              <select 
                className="select select-bordered w-full max-w-xs"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              className="btn btn-ghost"
              onClick={() => {
                setStatusFilter("");
                setRoleFilter("");
                setSearchQuery("");
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <UsersTable 
          statusFilter={statusFilter} 
          roleFilter={roleFilter}
          searchQuery={searchQuery}
        />
      </div>

      {/* Add Last Updated Info */}
      <div className="mt-4 text-sm text-gray-500 text-right">
        Last updated: {stats.lastUpdated.toLocaleString()}
      </div>
    </main>
  );
}

export default SprUsers;
