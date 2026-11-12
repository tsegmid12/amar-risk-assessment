
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Plus,
  Trash2,
  ShieldCheck,
  Loader2,
  Search,
  CheckCircle2,
  Layers3,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const AdditionalService = () => {
  const [services, setServices] = useState([]);
  const [serviceName, setServiceName] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  // Жагсаалт авах
  const fetchServices = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API_URL}/additional-services`);

      setServices(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Нэг үйлчилгээ нэмэх
  const addService = async () => {
    const name = serviceName.trim();

    if (!name || saving) return;

    const exists = services.some(
      (item) =>
        String(item.name ?? "").trim().toLowerCase() ===
        name.toLowerCase()
    );

    if (exists) {
      alert("Энэ үйлчилгээ бүртгэлтэй байна.");
      return;
    }

    try {
      setSaving(true);

      const res = await axios.post(`${API_URL}/additional-services`, {
        name,
      });

      setServices((prev) => [...prev, res.data]);
      setServiceName("");
    } catch (err) {
      console.error("Add error:", err);
      alert(err.response?.data?.message || "Нэмэхэд алдаа гарлаа.");
    } finally {
      setSaving(false);
    }
  };

  // Нэг үйлчилгээ устгах
  const handleDelete = async (id) => {
    if (!window.confirm("Үйлчилгээг устгах уу?")) return;

    try {
      setDeletingId(id);

      await axios.delete(`${API_URL}/additional-services/${id}`);

      setServices((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Устгахад алдаа гарлаа.");
    } finally {
      setDeletingId(null);
    }
  };

  // Хайлт
  const filteredServices = services.filter((item) =>
    String(item.name ?? "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f7f8fa] px-4 py-6 sm:px-6 lg:pr-20 lg:pl-85">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-7">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-500">
            <Layers3 size={15} />
            AMAР / Нэмэлт үйлчилгээ
          </div>

          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Нэмэлт үйлчилгээ
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Даатгалын бүтээгдэхүүнд санал болгох нэмэлт үйлчилгээг удирдах
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Нийт үйлчилгээ</p>
                <h3 className="mt-2 text-3xl font-bold text-gray-900">
                  {services.length}
                </h3>
              </div>
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <ShieldCheck size={23} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Бүртгэлтэй үйлчилгээ</p>
                <h3 className="mt-2 text-3xl font-bold text-green-600">
                  {services.length}
                </h3>
              </div>
              <div className="rounded-xl bg-green-50 p-3 text-green-600">
                <CheckCircle2 size={23} />
              </div>
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.85fr_1.5fr]">

          {/* Add */}
          <div className="h-fit rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-red-50 p-3 text-red-500">
                <Plus size={22} />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">
                  Үйлчилгээ нэмэх
                </h2>
                <p className="text-xs text-gray-400">
                  Нэг нэгээр нь бүртгэх
                </p>
              </div>
            </div>

            <label className="mb-2 block text-sm font-medium text-gray-700">
              Үйлчилгээний нэр
            </label>

            <textarea
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addService()}
              placeholder="Нэмэлт үйлчилгээний нэр"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-50"
            />

            <button
              onClick={addService}
              disabled={!serviceName.trim() || saving}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-40"
            >
              {saving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Plus size={18} />
              )}
              {saving ? "Хадгалж байна..." : "Нэмэх"}
            </button>

          </div>

          {/* List */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-bold text-gray-900">
                  Үйлчилгээний жагсаалт
                </h2>
                <p className="mt-1 text-xs text-gray-400">
                  Нийт {services.length} үйлчилгээ
                </p>
              </div>

              <div className="relative sm:w-52">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Хайх..."
                  className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-red-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              {loading ? (
                <div className="flex justify-center py-16">
                  <Loader2 size={28} className="animate-spin text-red-500" />
                </div>
              ) : filteredServices.length === 0 ? (
                <div className="py-16 text-center text-sm text-gray-500">
                  {search
                    ? "Үйлчилгээ олдсонгүй."
                    : "Үйлчилгээ бүртгэгдээгүй байна."}
                </div>
              ) : (
                filteredServices.map((service, index) => (
                  <div
                    key={service._id}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-3 py-3 transition hover:border-red-100 hover:bg-red-50/30 sm:px-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-sm font-semibold text-gray-500">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <p className=" text-sm font-medium text-gray-800">
                        {service.name}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDelete(service._id)}
                      disabled={deletingId === service._id}
                      title="Устгах"
                      className="shrink-0 rounded-lg p-2 text-gray-400 transition hover:bg-red-100 hover:text-red-500 disabled:opacity-40"
                    >
                      {deletingId === service._id ? (
                        <Loader2 size={17} className="animate-spin" />
                      ) : (
                        <Trash2 size={17} />
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdditionalService;
