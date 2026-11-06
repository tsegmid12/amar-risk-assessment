import axios from "axios";
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Building2,
  TrendingUp,
  ChevronRight,
  Eye,
  X,
  MapPin,
  Mail,
  CalendarDays,
  SlidersHorizontal,
  FileText,
  LoaderCircle,
  AlertCircle,
  ShieldCheck,
  Trash,
  Wallet,
  Percent,
  ClipboardList,
} from "lucide-react";

const filters = ["Бүгд", "Өнөөдөр", "7 хоног", "30 хоног"];

const DAY = 24 * 60 * 60 * 1000;

const formatNumber = (v) =>
  String(Math.round(Number(v) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const offerFee = (o) =>
  Number(o.feeAmount) ||
  Math.round(((Number(o.valuation) || 0) * (Number(o.feePercentage) || 0)) / 100);

// API-аас ирсэн өгөгдлийг нэг хэлбэрт оруулна.
const normalizePriceOffer = (item, index) => {
  const offers = (Array.isArray(item.priceOffers) ? item.priceOffers : []).map(
    (o, i) => {
      const valuation = Number(o.valuation) || 0;
      const feePercentage = Number(o.feePercentage) || 0;
      return {
        id: o._id || `${index}-offer-${i}`,
        name:
          o.insuranceId?.name ||
          o.insuranceName ||
          o.name ||
          "Нэргүй даатгал",
        valuation,
        feePercentage,
        feeAmount: offerFee({ ...o, valuation, feePercentage }),
      };
    }
  );

  const createdAt = item.createdAt ? new Date(item.createdAt) : null;

  return {
    ...item,
    id: item._id || item.id || `price-offer-${index}`,
    name: item.organization || item.name || "Нэргүй байгууллага",
    location: item.address || item.location || "Байршил бүртгэгдээгүй",
    email: item.email || "",
    offers,
    totalValuation: offers.reduce((s, o) => s + o.valuation, 0),
    totalFee: offers.reduce((s, o) => s + o.feeAmount, 0),
    timestamp: createdAt ? createdAt.getTime() : 0,
    date: createdAt ? createdAt.toISOString().slice(0, 10) : "Огноо бүртгэгдээгүй",
  };
};

function StatCard({ title, value, subtitle, icon: Icon, color }) {
  const colors = {
    red: "bg-red-50 text-red-600",
    orange: "bg-orange-50 text-orange-600",
    green: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-3 wrap-break-word text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {value}
          </p>
          <p className="mt-1.5 text-xs text-gray-400">{subtitle}</p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${colors[color]}`}
        >
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function PriceOfferDetails({ item, onClose }) {
  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="price-offer-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-gray-100 bg-white p-5 sm:p-6">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Building2 size={24} />
            </div>

            <div className="min-w-0">
              <h2
                id="price-offer-title"
                className="wrap-break-word text-lg font-bold text-gray-900"
              >
                {item.name}
              </h2>
              <p className="mt-1 break-all text-sm text-gray-500">{item._id}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Хаах"
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs text-gray-500">Нийт үнэлгээ</p>
              <p className="mt-2 text-xl font-bold text-gray-900">
                {formatNumber(item.totalValuation)}
                <span className="ml-1 text-sm font-medium text-gray-400">₮</span>
              </p>
            </div>

            <div className="rounded-xl bg-green-50/70 p-4">
              <p className="text-xs text-gray-500">Нийт хураамж</p>
              <p className="mt-2 text-xl font-bold text-green-600">
                {formatNumber(item.totalFee)}
                <span className="ml-1 text-sm font-medium text-green-300">₮</span>
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs text-gray-500">Холбоо барих</p>
              <p className="mt-2 flex items-start gap-1.5 wrap-break-word text-sm font-semibold text-gray-800">
                <MapPin size={15} className="mt-0.5 shrink-0 text-red-500" />
                {item.location}
              </p>
              {item.email && (
                <p className="mt-1.5 flex items-start gap-1.5 break-all text-xs text-gray-500">
                  <Mail size={13} className="mt-0.5 shrink-0 text-gray-400" />
                  {item.email}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-400">{item.date}</p>
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="font-bold text-gray-900">Даатгалын үнийн санал</h3>
              <span className="text-xs text-gray-400">{item.offers.length} даатгал</span>
            </div>

            {item.offers.length > 0 ? (
              <div className="space-y-3">
                {item.offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="rounded-xl border border-gray-100 p-4"
                  >
                    <div className="mb-3 flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                        <ShieldCheck size={18} />
                      </div>
                      <span className="wrap-break-word text-sm font-semibold text-gray-800">
                        {offer.name}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="flex items-center gap-1 text-[11px] text-gray-400">
                          <Wallet size={12} /> Үнэлгээ
                        </p>
                        <p className="mt-1 font-bold text-gray-800">
                          {formatNumber(offer.valuation)} ₮
                        </p>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="flex items-center gap-1 text-[11px] text-gray-400">
                          <Percent size={12} /> Хувь
                        </p>
                        <p className="mt-1 font-bold text-gray-800">
                          {offer.feePercentage}%
                        </p>
                      </div>
                      <div className="rounded-lg bg-green-50 p-3">
                        <p className="text-[11px] text-gray-400">Хураамж</p>
                        <p className="mt-1 font-bold text-green-600">
                          {formatNumber(offer.feeAmount)} ₮
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center">
                <ShieldCheck size={28} className="mx-auto text-gray-300" />
                <p className="mt-3 text-sm text-gray-500">
                  Даатгалын үнийн санал бүртгэгдээгүй байна.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end border-t border-gray-100 p-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700"
          >
            Хаах
          </button>
        </div>
      </section>
    </div>
  );
}

export default function PriceOffers() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Бүгд");
  const [selectedItem, setSelectedItem] = useState(null);
  const [sortBy, setSortBy] = useState("default");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const authHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  const handleUnauthorized = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin/login", { replace: true });
  };

  useEffect(() => {
    let isMounted = true;

    const fetchPriceOffers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${API_URL}/all-price-offers`, authHeaders());
        const responseData = response.data;

        const data = Array.isArray(responseData)
          ? responseData
          : responseData?.priceOffers ?? responseData?.data ?? [];

        if (!Array.isArray(data)) {
          throw new Error("API-аас үнийн саналын массив өгөгдөл ирсэнгүй.");
        }

        if (isMounted) setItems(data.map(normalizePriceOffer));
      } catch (err) {
        if (err.response?.status === 401) {
          handleUnauthorized();
          return;
        }
        console.error("Error fetching price offers:", err);
        if (isMounted) {
          setError(
            err.response
              ? `API алдаа: ${err.response.status}. Backend сервер болон API замаа шалгана уу.`
              : err.message || "Үнийн саналын мэдээлэл татахад алдаа гарлаа."
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPriceOffers();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const now = Date.now();

    const withinFilter = (item) => {
      if (selectedFilter === "Бүгд") return true;
      const age = now - item.timestamp;
      if (selectedFilter === "Өнөөдөр") return age <= DAY;
      if (selectedFilter === "7 хоног") return age <= 7 * DAY;
      return age <= 30 * DAY;
    };

    return items
      .filter((item) => {
        const text = [item.name, item.email, item.location, item._id]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return text.includes(query) && withinFilter(item);
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "fee-desc":
            return b.totalFee - a.totalFee;
          case "fee-asc":
            return a.totalFee - b.totalFee;
          case "date-asc":
            return a.timestamp - b.timestamp;
          default:
            return b.timestamp - a.timestamp;
        }
      });
  }, [items, searchTerm, selectedFilter, sortBy]);

  const totalValuation = items.reduce((s, i) => s + i.totalValuation, 0);
  const totalFee = items.reduce((s, i) => s + i.totalFee, 0);
  const avgPercent = totalValuation
    ? ((totalFee / totalValuation) * 100).toFixed(2)
    : "0";
  const thisWeekCount = items.filter((i) => Date.now() - i.timestamp <= 7 * DAY).length;

  const handleDelete = async (id) => {
    if (!window.confirm("Та энэ үнийн саналыг устгахдаа итгэлтэй байна уу?")) return;

    try {
      setDeletingId(id);
      await axios.delete(`${API_URL}/price-offers/${id}`, authHeaders());
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      if (err.response?.status === 401) {
        handleUnauthorized();
        return;
      }
      console.error("Error deleting price offer:", err);
      alert("Устгах үед алдаа гарлаа");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <div className="mx-auto w-full min-w-0 space-y-7 p-4 sm:p-6 md:px-8 lg:p-10 lg:pl-85 lg:pr-20">
        <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-red-600">
              <ClipboardList size={16} />
              AMAR ADMINISTRATION
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Даатгалын үнийн санал
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Байгууллагуудад гаргасан даатгалын үнийн санал, хөрөнгийн
              үнэлгээ болон хураамжийн мэдээллийг хянах.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 shadow-sm">
            <CalendarDays size={17} className="text-red-600" />
            <span>Үнийн саналын жагсаалт</span>
          </div>
        </header>

        <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Нийт үнийн санал"
            value={loading ? "..." : items.length}
            subtitle={`Энэ 7 хоногт ${loading ? "..." : thisWeekCount}`}
            icon={ClipboardList}
            color="red"
          />

          <StatCard
            title="Нийт хөрөнгийн үнэлгээ"
            value={loading ? "..." : `${formatNumber(totalValuation)} ₮`}
            subtitle="Бүх саналын нийлбэр"
            icon={Wallet}
            color="blue"
          />

          <StatCard
            title="Нийт хураамж"
            value={loading ? "..." : `${formatNumber(totalFee)} ₮`}
            subtitle="Бүх саналын нийлбэр"
            icon={TrendingUp}
            color="green"
          />

          <StatCard
            title="Дундаж хураамжийн хувь"
            value={loading ? "..." : `${avgPercent}%`}
            subtitle="Хураамж / үнэлгээ"
            icon={Percent}
            color="orange"
          />
        </section>

        <section className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Байгууллага, имэйл, байршил..."
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-10 text-sm outline-none transition focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50"
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  aria-label="Хайлтыг цэвэрлэх"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <SlidersHorizontal size={16} />
                Хугацаа
              </div>

              <div className="flex flex-wrap gap-2">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setSelectedFilter(filter)}
                    className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                      selectedFilter === filter
                        ? "bg-red-600 text-white shadow-sm shadow-red-200"
                        : "border border-gray-200 bg-white text-gray-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-500">
              Илэрц:{" "}
              <span className="font-semibold text-gray-900">
                {filteredItems.length}
              </span>{" "}
              үнийн санал
            </p>

            <label className="flex items-center gap-2 text-sm text-gray-500">
              Эрэмбэлэх
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-red-300"
              >
                <option value="default">Эрэмблэх</option>
                <option value="date-desc">Шинэ нь эхэндээ</option>
                <option value="date-asc">Хуучин нь эхэндээ</option>
                <option value="fee-desc">Хураамж өндрөөс</option>
                <option value="fee-asc">Хураамж багаас</option>
              </select>
            </label>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-bold text-gray-900">Үнийн саналын жагсаалт</h2>
              <p className="mt-1 text-xs text-gray-400">
                Байгууллага бүрийн даатгалын үнийн санал
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <FileText size={19} />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center px-5 py-16">
              <LoaderCircle size={32} className="animate-spin text-red-600" />
              <p className="mt-4 text-sm text-gray-500">
                Үнийн саналын мэдээлэл татаж байна...
              </p>
            </div>
          ) : error ? (
            <div className="px-5 py-16 text-center">
              <AlertCircle size={32} className="mx-auto text-red-500" />
              <h3 className="mt-4 font-bold text-gray-800">
                Мэдээлэл татахад алдаа гарлаа
              </h3>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-500">
                {error}
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Дахин ачаалах
              </button>
            </div>
          ) : filteredItems.length > 0 ? (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/80">
                    <tr className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      <th className="px-6 py-4">Байгууллага</th>
                      <th className="px-5 py-4">Байршил</th>
                      <th className="px-5 py-4">Даатгал</th>
                      <th className="px-5 py-4 text-right">Үнэлгээ</th>
                      <th className="px-5 py-4 text-right">Хураамж</th>
                      <th className="px-5 py-4">Огноо</th>
                      <th className="px-5 py-4 text-center">Дэлгэрэнгүй</th>
                      <th></th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="transition hover:bg-red-50/30">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                              <Building2 size={19} />
                            </div>

                            <div className="min-w-0">
                              <p className="wrap-break-word font-semibold text-gray-800">
                                {item.name}
                              </p>
                              {item.email && (
                                <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                                  <Mail size={12} />
                                  {item.email}
                                </p>
                              )}
                              <a href={`https://amardaatgal.vercel.app/${item._id}`} target="_blank" rel="noopener noreferrer" className="mt-0.5 flex items-center gap-1 text-xs text-blue-400 hover:text-red-600">
                                <FileText size={12} />
                                Үнийн саналын холбоос
                              </a>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="flex items-center gap-1.5 text-sm text-gray-600">
                            <MapPin size={14} className="shrink-0 text-gray-400" />
                            {item.location}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-100">
                            <ShieldCheck size={13} />
                            {item.offers.length}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-right text-sm text-gray-600">
                          {formatNumber(item.totalValuation)} ₮
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-bold text-gray-900">
                          {formatNumber(item.totalFee)} ₮
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">
                          {item.date}
                        </td>

                        <td className="px-5 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedItem(item)}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                          >
                            <Eye size={15} />
                            Дэлгэрэнгүй
                          </button>
                        </td>

                        <td>
                          <button
                            type="button"
                            disabled={deletingId === item.id}
                            onClick={() => handleDelete(item.id)}
                            aria-label="Устгах"
                            className="pr-6 disabled:opacity-40"
                          >
                            <Trash
                              size={20}
                              className="text-red-600 hover:text-red-800"
                            />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="space-y-3 p-3 md:hidden">
                {filteredItems.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-xl border border-gray-100 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                        <Building2 size={19} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="wrap-break-word font-semibold text-gray-900">
                          {item.name}
                        </h3>
                        {item.email && (
                          <p className="mt-1 break-all text-xs text-gray-400">
                            {item.email}
                          </p>
                        )}
                        <p className="mt-2 text-xs text-gray-400">
                          {item.date} · {item.offers.length} даатгал
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={deletingId === item.id}
                        onClick={() => handleDelete(item.id)}
                        aria-label="Устгах"
                        className="shrink-0 p-1 disabled:opacity-40"
                      >
                        <Trash size={18} className="text-red-600" />
                      </button>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-[11px] text-gray-400">Үнэлгээ</p>
                        <p className="mt-1 text-sm font-bold text-gray-800">
                          {formatNumber(item.totalValuation)} ₮
                        </p>
                      </div>
                      <div className="rounded-lg bg-red-50 p-3">
                        <p className="text-[11px] text-red-400">Хураамж</p>
                        <p className="mt-1 text-sm font-bold text-red-600">
                          {formatNumber(item.totalFee)} ₮
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
                      <span className="flex min-w-0 items-center gap-1 text-xs text-gray-500">
                        <MapPin size={13} className="shrink-0" />
                        <span className="wrap-break-word">{item.location}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => setSelectedItem(item)}
                        className="flex shrink-0 items-center gap-1 text-sm font-semibold text-red-600"
                      >
                        Дэлгэрэнгүйasdg
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="px-5 py-16 text-center">
              <Search size={30} className="mx-auto text-gray-300" />

              <h3 className="mt-4 font-bold text-gray-800">
                Үнийн санал олдсонгүй
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                {items.length === 0
                  ? "Шинэ үнийн санал нэмсний дараа энд харагдана."
                  : "Хайлтын үг эсвэл хугацаагаа өөрчилж үзнэ үү."}
              </p>

              {items.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedFilter("Бүгд");
                  }}
                  className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Шүүлт цэвэрлэх
                </button>
              )}
            </div>
          )}

          <div className="border-t border-gray-100 bg-gray-50/70 px-5 py-3 text-xs text-gray-400">
            {loading
              ? "Өгөгдөл ачаалж байна."
              : `Нийт ${items.length} үнийн саналын бүртгэл.`}
          </div>
        </section>
      </div>

      <PriceOfferDetails item={selectedItem} onClose={() => setSelectedItem(null)} />
    </main>
  );
}