import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { ClipboardList, Users, ShieldCheck, Activity, Search } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const ROLE_STYLES = {
  admin: 'bg-red-50 text-red-600 ring-red-200',
  user: 'bg-slate-100 text-slate-600 ring-slate-200',
};

const getInitials = (email = '') => email.slice(0, 2).toUpperCase();

// Эрсдэлийн үнэлгээ аль хэрэглэгчийнх вэ гэдгийг таних (талбарын нэрийг backend-д тааруулаарай)
const belongsTo = (assessment, user) => {
  const owner = assessment.userId ?? assessment.user?._id ?? assessment.user;
  return owner === user._id;
};

const StatCard = ({ icon: Icon, label, value, tone }) => (
  <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_4px_20px_rgba(15,23,42,0.06)]">
    <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tone}`}>
      <Icon size={22} />
    </span>
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

const ManageUser = () => {
  const [users, setUsers] = useState([]);
  const [riskAssessments, setRiskAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const roles = ['superadmin', 'admin'];
  const [savingId, setSavingId] = useState(null);

  const handleUpdate = async (userId, updatedData) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user._id === userId ? { ...user, ...updatedData } : user))
    );

    setSavingId(userId);

    try{
        await axios.put(`${API_URL}/users/${userId}`, updatedData, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
    }
    catch (err) {
        console.error('Error updating user:', err);
        setError('Хэрэглэгчийн мэдээллийг шинэчилж чадсангүй');
    }
    finally {
        setSavingId(null);
    }
  }

  useEffect(() => {
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

    const fetchData = async () => {
      try {
        const [usersRes, risksRes] = await Promise.all([
          axios.get(`${API_URL}/users`, { headers }),
          axios.get(`${API_URL}/risk-assessments`, { headers }),
        ]);
        setUsers(usersRes.data);
        setRiskAssessments(risksRes.data);
      } catch (err) {
        setError('Хэрэглэгчдийн мэдээллийг татаж чадсангүй');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users
      .filter((u) => u.email?.toLowerCase().includes(q))
      .map((u) => ({
        ...u,
        assessmentCount: riskAssessments.filter((a) => belongsTo(a, u)).length,
      }));
  }, [users, riskAssessments, query]);

  const adminCount = users.filter((u) => u.role === 'admin').length;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      {/* Breadcrumb */}
      <nav className="mb-3 flex items-center gap-2 text-sm text-slate-400">
        <ClipboardList size={16} />
        <span>Админ</span>
        <span>/</span>
        <span className="text-red-600">Хэрэглэгч удирдах</span>
      </nav>

      {/* Гарчиг */}
      <header className="mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Хэрэглэгч удирдах
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Хэрэглэгчдийн мэдээллийг нэг дор удирдаарай.
        </p>
      </header>

      {/* Статистик */}
      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        <StatCard icon={Users} label="Нийт хэрэглэгч" value={loading ? '–' : users.length} tone="bg-red-50 text-red-600" />
        <StatCard icon={ShieldCheck} label="Админ" value={loading ? '–' : adminCount} tone="bg-emerald-50 text-emerald-600" />
        <StatCard icon={Activity} label="Эрсдэлийн үнэлгээ" value={loading ? '–' : riskAssessments.length} tone="bg-orange-50 text-orange-600" />
      </div>

      {/* Жагсаалтын толгой + хайлт */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Бүх хэрэглэгч</h3>
          <p className="text-sm text-slate-500">{rows.length} хэрэглэгч бүртгэгдсэн</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Хэрэглэгч хайх..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
          />
        </div>
      </div>

      {error && (
        <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Хүснэгт */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-slate-500">
              <tr>
                <th scope="col" className="px-6 py-3.5 font-medium">Имэйл</th>
                <th scope="col" className="px-6 py-3.5 font-medium">Статус</th>
                <th scope="col" className="px-6 py-3.5 text-right font-medium">Эрсдэлийн үнэлгээ</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4" colSpan={3}>
                      <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                    </td>
                  </tr>
                ))}

              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                    {query ? 'Хайлтад тохирох хэрэглэгч олдсонгүй' : 'Хэрэглэгч бүртгэгдээгүй байна'}
                  </td>
                </tr>
              )}

              {!loading &&
                rows.map((user) => (
                  <tr key={user._id} className="transition-colors hover:bg-red-50/40">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-xs font-bold text-red-600">
                          {getInitials(user.email)}
                        </span>
                        <span className="font-medium text-slate-800">{user.email}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                        <select
                            value={user.role}
                            disabled={savingId === user._id}
                            onChange={(e) => handleUpdate(user._id, { role: e.target.value })}
                            className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset focus:outline-none focus:ring-2 disabled:opacity-50 ${
                            ROLE_STYLES[user.role] ?? ROLE_STYLES.user
                            }`}
                        >
                            {roles.map((r) => (
                            <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </td>

                    <td className="px-6 py-4 text-right font-semibold tabular-nums text-slate-700">
                      {user.assessmentCount}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageUser;  