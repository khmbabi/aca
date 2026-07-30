import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';
import { Users, Mail, Shield, ShieldCheck, Search, Filter } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'profiles'));
        const usersList: UserProfile[] = [];
        querySnapshot.forEach((doc) => {
          usersList.push(doc.data() as UserProfile);
        });
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => 
    (user.firstName + ' ' + user.lastName).toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-display">User Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Monitor all registered farmers and platform users.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-4 text-primary-600 mb-4">
            <Users size={24} />
            <h3 className="font-bold">Total Users</h3>
          </div>
          <p className="text-4xl font-black text-gray-900 dark:text-white">{users.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-4 text-green-600 mb-4">
            <ShieldCheck size={24} />
            <h3 className="font-bold">Verified Admins</h3>
          </div>
          <p className="text-4xl font-black text-gray-900 dark:text-white">
            {users.filter(u => u.is_admin).length}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-4 text-amber-600 mb-4">
            <Filter size={24} />
            <h3 className="font-bold">Organizations</h3>
          </div>
          <p className="text-4xl font-black text-gray-900 dark:text-white">
            {users.filter(u => u.is_organization).length}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredUsers.map((user, idx) => (
                <motion.tr 
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-bold overflow-hidden">
                        {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" /> : user.firstName[0]}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-500">@{user.username || 'n/a'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <Mail size={12} />
                        {user.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-lg text-[10px] font-bold uppercase",
                      user.is_organization ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                    )}>
                      {user.is_organization ? 'Org' : 'Standard'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.is_admin ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-primary-600">
                        <Shield size={14} />
                        Admin
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 font-medium">User</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-xs font-bold text-primary-600 hover:underline">View Details</button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading && (
          <div className="p-10 text-center text-gray-500">Loading users...</div>
        )}
        {!loading && filteredUsers.length === 0 && (
          <div className="p-10 text-center text-gray-500">No users found matching your search.</div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
