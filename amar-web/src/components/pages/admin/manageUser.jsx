
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  ClipboardList,
  Users,
  ShieldCheck,
  Activity,
  Search,
  Trash,
  Pen,
  X
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const ROLE_STYLES = {
  superadmin: 'bg-red-50 text-red-600 ring-red-200',
  admin: 'bg-green-100 text-green-600 ring-green-200',
};

const getInitials = (email = '') =>
  email.slice(0, 2).toUpperCase();

// Хэрэглэгчийн ID шалгах
const belongsTo = (assessment, user) => {
  const owner =
    assessment.userId?._id ??
    assessment.userId ??
    assessment.user?._id ??
    assessment.user;

  return String(owner) === String(user._id);
};

// Статистик карт
const StatCard = ({ icon: Icon, label, value, tone }) => (
  <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_4px_20px_rgba(15,23,42,0.06)]">
    <span
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tone}`}
    >
      <Icon size={22} />
    </span>

    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

// Bitrix ID Modal
const Modal = ({
  isOpen,
  onClose,
  user,
  bitrixId,
  setBitrixId,
  onSave,
  saving,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 cursor-pointer text-xl text-gray-500 hover:text-gray-900"
        >
          <X className="h-6 w-6 hover:scale-110 duration-300"/>
        </button>

        <h3 className="text-lg font-bold text-gray-900">
          Bitrix ID нэмэх / засах
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          {user?.email}
        </p>

        <label className="mt-5 block text-sm font-medium text-gray-700">
          Bitrix ID
        </label>

        <input
          type="text"
          placeholder="Bitrix ID оруулна уу"
          value={bitrixId}
          onChange={(e) => setBitrixId(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSave();
          }}
          className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
        />

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 font-medium text-gray-700 cursor-pointer duration-300 hover:bg-gray-100 disabled:opacity-50"
          >
            Болих
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="w-full rounded-lg bg-red-500 px-3 py-2 font-medium text-white transition cursor-pointer duration-300 hover:bg-red-600 disabled:opacity-50"
          >
            {saving ? 'Хадгалж байна...' : 'Хадгалах'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ManageUser = () => {
  const [users, setUsers] = useState([]);
  const [riskAssessments, setRiskAssessments] = useState([]);
  const [priceOffer, setPriceOffer] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState('');
  const [savingId, setSavingId] = useState(null);

  // Bitrix Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [bitrixId, setBitrixId] = useState('');
  const [savingBitrix, setSavingBitrix] = useState(false);

  const roles = ['superadmin', 'admin'];

  const headers = {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  };

  // Хэрэглэгчийн мэдээлэл татах
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, risksRes, priceOffersRes] =
          await Promise.all([
            axios.get(`${API_URL}/users`, { headers }),
            axios.get(`${API_URL}/all-risk-assessments`, {
              headers,
            }),
            axios.get(`${API_URL}/all-price-offers`, {
              headers,
            }),
          ]);

        setUsers(usersRes.data);
        setRiskAssessments(risksRes.data);
        setPriceOffer(priceOffersRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Хэрэглэгчдийн мэдээллийг татаж чадсангүй');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Modal нээх
  const openEditModal = (user) => {
    setSelectedUser(user);
    setBitrixId(user.bitrixId || '');
    setModalOpen(true);
  };

  // Modal хаах
  const closeModal = () => {
    if (savingBitrix) return;

    setModalOpen(false);
    setSelectedUser(null);
    setBitrixId('');
  };

  // Bitrix ID хадгалах
  const handleSaveBitrix = async () => {
    if (!selectedUser || savingBitrix) return;

    const updatedBitrixId = bitrixId.trim();

    setSavingBitrix(true);
    setError(null);

    try {
      await axios.put(
        `${API_URL}/users/${selectedUser._id}`,
        { bitrixId: updatedBitrixId },
        { headers }
      );

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === selectedUser._id
            ? { ...user, bitrixId: updatedBitrixId }
            : user
        )
      );

      setModalOpen(false);
      setSelectedUser(null);
      setBitrixId('');
    } catch (err) {
      console.error('Bitrix ID update error:', err);
      setError('Bitrix ID хадгалж чадсангүй');
    } finally {
      setSavingBitrix(false);
    }
  };

  // Хэрэглэгч устгах
  const handleDelete = async (userId) => {
    const confirmDelete = window.confirm(
      'Та энэ хэрэглэгчийг устгахдаа итгэлтэй байна уу?'
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/users/${userId}`, {
        headers,
      });

      setUsers((prevUsers) =>
        prevUsers.filter((user) => user._id !== userId)
      );
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Хэрэглэгчийг устгаж чадсангүй');
    }
  };

  // Хэрэглэгчийн эрх шинэчлэх
  const handleUpdate = async (userId, updatedData) => {
    const previousUsers = users;

    setSavingId(userId);
    setError(null);

    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user._id === userId
          ? { ...user, ...updatedData }
          : user
      )
    );

    try {
      await axios.put(
        `${API_URL}/users/${userId}`,
        updatedData,
        { headers }
      );
    } catch (err) {
      console.error('Error updating user:', err);

      setUsers(previousUsers);
      setError('Хэрэглэгчийн мэдээллийг шинэчилж чадсангүй');
    } finally {
      setSavingId(null);
    }
  };

  // Хайлт болон хэрэглэгчийн статистик
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();

    return users
      .filter((user) =>
        user.email?.toLowerCase().includes(q)
      )
      .map((user) => ({
        ...user,
        assessmentCount: riskAssessments.filter((assessment) =>
          belongsTo(assessment, user)
        ).length,
        priceOfferCount: priceOffer.filter((offer) =>
          belongsTo(offer, user)
        ).length,
      }));
  }, [users, riskAssessments, priceOffer, query]);

  const adminCount = users.filter(
    (user) => user.role === 'admin'
  ).length;

  return (
    <div className="mx-auto w-full min-w-0 space-y-7 p-4 sm:p-6 md:px-8 lg:p-10 lg:pl-85 lg:pr-20">

      {/* Breadcrumb */}
      <nav className="mb-3 flex items-center gap-2 text-sm text-slate-400">
        <ClipboardList size={16} />
        <span>Админ</span>
        <span>/</span>
        <span className="text-red-600">
          Хэрэглэгч удирдах
        </span>
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
        <StatCard
          icon={Users}
          label="Нийт хэрэглэгч"
          value={loading ? '–' : users.length}
          tone="bg-red-50 text-red-600"
        />

        <StatCard
          icon={ShieldCheck}
          label="Админ"
          value={loading ? '–' : adminCount}
          tone="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          icon={Activity}
          label="Эрсдэлийн үнэлгээ"
          value={loading ? '–' : riskAssessments.length}
          tone="bg-orange-50 text-orange-600"
        />
      </div>

      {/* Жагсаалтын толгой + хайлт */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Бүх хэрэглэгч
          </h3>

          <p className="text-sm text-slate-500">
            {rows.length} хэрэглэгч бүртгэгдсэн
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Хэрэглэгч хайх..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
          />
        </div>
      </div>

      {/* Алдааны мэдээлэл */}
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* Хэрэглэгчийн хүснэгт */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-3.5 font-medium">
                  Имэйл
                </th>

                <th className="px-6 py-3.5 font-medium">
                  Статус
                </th>

                <th className="px-6 py-3.5 text-center font-medium">
                  Bitrix ID
                </th>

                <th className="px-6 py-3.5 text-center font-medium">
                  Үнийн санал
                </th>

                <th className="px-6 py-3.5 text-center font-medium">
                  Эрсдэлийн үнэлгээ
                </th>

                <th className="px-6 py-3.5 text-center font-medium">
                  Үйлдэл
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">

              {/* Loading */}
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4" colSpan={6}>
                      <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                    </td>
                  </tr>
                ))}

              {/* Empty */}
              {!loading && rows.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    {query
                      ? 'Хайлтад тохирох хэрэглэгч олдсонгүй'
                      : 'Хэрэглэгч бүртгэгдээгүй байна'}
                  </td>
                </tr>
              )}

              {/* Users */}
              {!loading &&
                rows.map((user) => (
                  <tr
                    key={user._id}
                    className="transition-colors hover:bg-red-50/40"
                  >
                    {/* Email */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-xs font-bold text-red-600">
                          {getInitials(user.email)}
                        </span>

                        <span className="font-medium text-slate-800">
                          {user.email}
                        </span>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        disabled={savingId === user._id}
                        onChange={(e) =>
                          handleUpdate(user._id, {
                            role: e.target.value,
                          })
                        }
                        className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset focus:outline-none focus:ring-2 disabled:opacity-50 ${
                          ROLE_STYLES[user.role] ??
                          'bg-slate-100 text-slate-600 ring-slate-200'
                        }`}
                      >
                        {roles.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Bitrix ID */}
                    <td className="px-6 py-4 text-center font-semibold tabular-nums text-gray-700">
                      {user.bitrixId || (
                        <span className="text-gray-400">
                          —
                        </span>
                      )}
                    </td>

                    {/* Price offer count */}
                    <td className="px-6 py-4 text-center font-semibold tabular-nums text-gray-700">
                      {user.priceOfferCount}
                    </td>

                    {/* Assessment count */}
                    <td className="px-6 py-4 text-center font-semibold tabular-nums text-slate-700">
                      {user.assessmentCount}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 text-end">
                      <div className="flex justify-around pr-4">

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => openEditModal(user)}
                          aria-label="Хэрэглэгч засах"
                        >
                          <Pen
                            size={20}
                            className="cursor-pointer text-gray-400 transition hover:scale-110 hover:text-gray-700"
                          />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleDelete(user._id)}
                          aria-label="Хэрэглэгч устгах"
                        >
                          <Trash
                            size={20}
                            className="cursor-pointer text-red-500 transition duration-200 hover:scale-110 hover:text-red-700"
                          />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bitrix ID Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        user={selectedUser}
        bitrixId={bitrixId}
        setBitrixId={setBitrixId}
        onSave={handleSaveBitrix}
        saving={savingBitrix}
      />

    </div>
  );
};

export default ManageUser;
