
import axios from "axios";
import { useMemo, useState, useEffect } from "react";
import  { useNavigate } from "react-router-dom";
import {
  Search,
  Building2,
  ShieldAlert,
  TrendingUp,
  ChevronRight,
  Eye,
  X,
  MapPin,
  CalendarDays,
  Activity,
  Flame,
  Zap,
  Waves,
  Mountain,
  CheckCircle2,
  SlidersHorizontal,
  FileText,
  LoaderCircle,
  Pencil,
  AlertCircle,
  ShieldCheck,
  Trash 
} from "lucide-react";
import { jwtDecode } from "jwt-decode";


const filters = ["Бүгд", "Бага", "Дунд", "Их", "Маш их"];

const getRiskLevel = (score) => {
  const value = Number(score) || 0;

  if (value <= 30) return "Бага";
  if (value <= 40) return "Дунд";
  if (value <= 60) return "Их";
  return "Маш их";
};

const riskStyles = {
  Бага: {
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    bar: "bg-emerald-500",
    text: "text-emerald-600",
  },
  Дунд: {
    badge: "bg-yellow-50 text-yellow-700 ring-yellow-100",
    bar: "bg-yellow-500",
    text: "text-yellow-600",
  },
  Их: {
    badge: "bg-orange-50 text-orange-700 ring-orange-100",
    bar: "bg-orange-500",
    text: "text-orange-600",
  },
  "Маш их": {
    badge: "bg-red-50 text-red-700 ring-red-100",
    bar: "bg-red-500",
    text: "text-red-600",
  },
};

const getRiskIcon = (name = "") => {
  const value = String(name).toLowerCase();

  if (value.includes("гал") || value.includes("fire")) {
    return Flame;
  }

  if (
    value.includes("цахилгаан") ||
    value.includes("electric")
  ) {
    return Zap;
  }

  if (
    value.includes("үер") ||
    value.includes("ус") ||
    value.includes("усан") ||
    value.includes("water")
  ) {
    return Waves;
  }

  if (
    value.includes("газар хөдлөлт") ||
    value.includes("газар") ||
    value.includes("earthquake")
  ) {
    return Mountain;
  }

  return ShieldAlert;
};


// API-аас ирсэн өгөгдлийг нэг хэлбэрт оруулна.
const normalizeOrganization = (item, index) => {
  const rawRisks = Array.isArray(item.risks) ? item.risks : [];

  const risks = rawRisks.map((risk, riskIndex) => {
    const name = risk.name || risk.type || "Бусад эрсдэл";
    const score = Math.min(
      100,
      Math.max(0, Number(risk.score) || 0)
    );

    return {
      ...risk,
      id: risk._id || risk.id || `${index}-risk-${riskIndex}`,
      name,
      score,
      icon: getRiskIcon(name),
    };
  });

  const riskAverage = risks.length
    ? Math.round(
        risks.reduce((sum, risk) => sum + risk.score, 0) /
          risks.length
      )
    : 0;

  const scoreValue = Number(item.score);

  return {
    ...item,
    id: item._id || item.id || `organization-${index}`,
    name:
      item.name ||
      item.organization ||
      item.organizationName ||
      "Нэргүй байгууллага",
    registration:
      item.registration ||
      item.registrationNumber ||
      item.registerNumber ||
      item.regNumber ||
      "Регистр бүртгэгдээгүй",
    location: item.location || item.address || "Байршил бүртгэгдээгүй",
    date: item.date
      ? String(item.date).slice(0, 10)
      : item.createdAt
        ? String(item.createdAt).slice(0, 10)
        : "Огноо бүртгэгдээгүй",
    risks,
    score: Number.isFinite(scoreValue)
      ? Math.min(100, Math.max(0, scoreValue))
      : riskAverage,
  };
};

function RiskBadge({ level }) {
  const style = riskStyles[level] || riskStyles["Бага"];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${style.badge}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {level}
    </span>
  );
}

function ScoreBar({ score = 0 }) {
  const value = Math.min(100, Math.max(0, Number(score) || 0));
  const level = getRiskLevel(value);
  const style = riskStyles[level];

  return (
    <div className="min-w-28">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className={`text-sm font-bold ${style.text}`}>
          {value}
        </span>
        <span className="text-xs text-gray-400">/ 100</span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${style.bar}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
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
          <p className="mt-3 wrap-break-word text-3xl font-bold tracking-tight text-gray-900">
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

function OrganizationDetails({ organization, onClose }) {
  if (!organization) return null;

  const risks = Array.isArray(organization.risks)
    ? organization.risks
    : [];

    const selectedInsurance = Array.isArray(organization.selectedInsurance)
      ? organization.selectedInsurance
      : [];

  const averageScore = risks.length
    ? Math.round(
        risks.reduce(
          (sum, risk) => sum + (Number(risk.score) || 0),
          0
        ) / risks.length
      )
    : 0;

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
        aria-labelledby="organization-title"
        className="max-h-[90vh] w-full max-w-2xl animate-in fade-in zoom-in-95 overflow-y-auto rounded-2xl bg-white shadow-2xl duration-200"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-gray-100 bg-white p-5 sm:p-6">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Building2 size={24} />
            </div>

            <div className="min-w-0">
              <h2
                id="organization-title"
                className="wrap-break-word text-lg font-bold text-gray-900"
              >
                {organization.name}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {organization._id}
              </p>
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

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {organization.score}
                <span className="text-sm font-medium text-gray-400">
                  /100
                </span>
              </p>

              <div className="mt-2">
                <RiskBadge level={getRiskLevel(organization.score)} />
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs text-gray-500">Эрсдэлийн төрөл</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {risks.length}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Үнэлгээнд хамрагдсан
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs text-gray-500">Байршил</p>

              <p className="mt-2 flex items-start gap-1.5 break-words text-sm font-semibold text-gray-800">
                <MapPin
                  size={15}
                  className="mt-0.5 shrink-0 text-red-500"
                />
                {organization.location}
              </p>

              <p className="mt-2 text-xs text-gray-400">
                {organization.date}
              </p>
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="font-bold text-gray-900">
                Эрсдэлийн дэлгэрэнгүй
              </h3>

              <span className="text-xs text-gray-400">
                {risks.length} үзүүлэлт
              </span>
            </div>

            {risks.length > 0 ? (
              <div className="space-y-4">
                {risks.map((risk) => {
                  const Icon = risk.icon || ShieldAlert;

                  return (
                    <div
                      key={risk._id || risk.name}
                      className="rounded-xl border border-gray-100 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-600">
                            <Icon size={18} />
                          </div>

                          <span className="wrap-break-word text-sm font-semibold text-gray-800">
                            {risk.name}
                          </span>
                        </div>

                        <RiskBadge level={getRiskLevel(risk.score)} />
                      </div>

                      <ScoreBar score={risk.score} />

                      {risk.description && (
                        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-500">
                          {risk.description}
                        </p>
                      )}

                      {risk.location && (
                        <p className="mt-2 text-xs text-gray-400">
                          Байршил: {risk.location}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center">
                <ShieldCheck
                  size={28}
                  className="mx-auto text-gray-300"
                />
                <p className="mt-3 text-sm text-gray-500">
                  Эрсдэлийн дэлгэрэнгүй мэдээлэл бүртгэгдээгүй байна.
                </p>
              </div>
            )}
          </div>

          <div className="border border-gray-200 rounded-xl p-4">
            {
              selectedInsurance.length > 0 ? (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-900">
                    Сонгогдсон даатгалын бүтээгдэхүүн
                  </h3>
                  <ul className="space-y-2">
                    {selectedInsurance.map((insurance) => (
                      <li
                        key={insurance._id || insurance.id}
                        className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700"
                      >
                        <span className="font-semibold">
                          {insurance.name || insurance.productName || "Нэргүй бүтээгдэхүүн"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-center">
                  <ShieldCheck

                    size={28}
                    className="mx-auto text-gray-300"
                  />
                  <p className="mt-3 text-sm text-gray-500">
                    Сонгогдсон даатгалын бүтээгдэхүүн бүртгэгдээгүй байна.
                  </p>
                </div>
              )
            }
          </div>

          <div className="rounded-xl border border-red-100 bg-red-50/70 p-4">
            <div className="flex items-start gap-3">
              <Activity
                size={19}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Эрсдэлийн үнэлгээний тайлбар
                </p>

                <p className="mt-1 text-sm leading-6 text-gray-600">
                  {risks.length > 0
                    ? `Эрсдэлийн үзүүлэлтүүдийн дундаж оноо ${averageScore}/100 байна. Нийт үнэлгээ болон тус бүрийн эрсдэлийг харгалзан хамгаалалтын арга хэмжээг төлөвлөнө.`
                    : `Байгууллагын нийт үнэлгээ ${organization.score}/100 байна. Эрсдэлийн үзүүлэлтүүдийг дэлгэрэнгүй бүртгэснээр дундаж оноог тооцох боломжтой.`}
                </p>
              </div>
            </div>
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

export default function Organizations() {
  const [organizations, setOrganizations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Бүгд");
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [sortBy, setSortBy] = useState("score-desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    let isMounted = true;

    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${API_URL}/risk-assessments`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        // API массив эсвэл объект доторх массив буцаасан
        const responseData = response.data;

        const data = Array.isArray(responseData)
          ? responseData
          : responseData?.riskAssessments ??
            responseData?.assessments ??
            responseData?.organizations ??
            responseData?.data ??
            [];

        if (!Array.isArray(data)) {
          throw new Error(
            "API-аас байгууллагын массив өгөгдөл ирсэнгүй."
          );
        }

        const normalizedData = data.map(normalizeOrganization);

        if (isMounted) {
          setOrganizations(normalizedData);
        }

      } catch (err) {
        console.error("Error fetching organizations:", err);

        if (isMounted) {
          setError(
            err.response
              ? `API алдаа: ${err.response.status}. Backend сервер болон API замаа шалгана уу.`
              : err.message ||
                  "Байгууллагын мэдээлэл татахад алдаа гарлаа."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOrganizations();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredOrganizations = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return organizations
      .filter((organization) => {
        const searchableText = [
          organization.name,
          organization._id,
          organization.location,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch = searchableText.includes(query);

        const matchesRisk =
          selectedFilter === "Бүгд" ||
          getRiskLevel(organization.score) === selectedFilter;

        return matchesSearch && matchesRisk;
      })
      .sort((a, b) =>
        sortBy === "score-asc"
          ? a.score - b.score
          : b.score - a.score
      );
  }, [organizations, searchTerm, selectedFilter, sortBy]);

  // Байгууллага бүрийн нийт score-ийн дундаж
  const averageRisk = organizations.length
    ? Math.round(
        organizations.reduce(
          (sum, organization) =>
            sum + (Number(organization.score) || 0),
          0
        ) / organizations.length
      )
    : 0;

  const highRiskCount = organizations.filter(
    (organization) => organization.score > 40
  ).length;

  const lowRiskCount = organizations.filter(
    (organization) => organization.score <= 30
  ).length;

const navigate = useNavigate();

const handleDelete = async (organizationId) => {
  try{
    await axios.delete(`${API_URL}/riskAssessments/${organizationId}`)
    alert("Амжилттай устгалаа")
    navigate(0)
  } catch (error) {
    console.error("Error deleting organization:", error);
    alert("Алдаа гарлаа")
  }
}


  return (
    <main className="min-h-screen bg-[#f7f8fa] px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-red-600">
              <Building2 size={16} />
              AMAR ADMINISTRATION
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Байгууллагуудын эрсдэлийн үнэлгээ
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Бүртгэлтэй байгууллагуудын эрсдэлийн оноо, түвшин болон
              үнэлгээний дэлгэрэнгүй мэдээллийг хянах.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 shadow-sm">
            <CalendarDays size={17} className="text-red-600" />
            <span>Үнэлгээний жагсаалт</span>
          </div>
        </header>

        <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Нийт байгууллага"
            value={loading ? "..." : organizations.length}
            subtitle="Бүх бүртгэлтэй байгууллага"
            icon={Building2}
            color="red"
          />

          <StatCard
            title="Дундаж эрсдэлийн оноо"
            value={loading ? "..." : `${averageRisk}/100`}
            subtitle={`${getRiskLevel(averageRisk)} түвшин`}
            icon={TrendingUp}
            color="blue"
          />

          <StatCard
            title="Өндөр эрсдэлтэй"
            value={loading ? "..." : highRiskCount}
            subtitle="Оноо 40-өөс дээш"
            icon={ShieldAlert}
            color="orange"
          />

          <StatCard
            title="Бага эрсдэлтэй"
            value={loading ? "..." : lowRiskCount}
            subtitle="Оноо 30 буюу түүнээс бага"
            icon={CheckCircle2}
            color="green"
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
                placeholder="Байгууллага, регистр, байршил..."
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
                Эрсдэлийн түвшин
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
                {filteredOrganizations.length}
              </span>{" "}
              байгууллага
            </p>

            <label className="flex items-center gap-2 text-sm text-gray-500">
              Эрэмбэлэх

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-red-300"
              >
                <option value="score-desc">Эрсдэл өндөрөөс</option>
                <option value="score-asc">Эрсдэл багатайгаас</option>
              </select>
            </label>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-bold text-gray-900">
                Байгууллагын жагсаалт
              </h2>
              <p className="mt-1 text-xs text-gray-400">
                Байгууллага бүрийн үнэлгээ
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <FileText size={19} />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center px-5 py-16">
              <LoaderCircle
                size={32}
                className="animate-spin text-red-600"
              />
              <p className="mt-4 text-sm text-gray-500">
                Байгууллагын мэдээлэл татаж байна...
              </p>
            </div>
          ) : error ? (
            <div className="px-5 py-16 text-center">
              <AlertCircle
                size={32}
                className="mx-auto text-red-500"
              />
              <h3 className="mt-4 font-bold text-gray-800">
                Мэдээлэл татахад алдаа гарлаа
              </h3>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-500">
                {error}
              </p>
              <p className="mt-2 text-xs text-gray-400">
                API: {API_URL}
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Дахин ачаалах
              </button>
            </div>
          ) : filteredOrganizations.length > 0 ? (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/80">
                    <tr className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      <th className="px-6 py-4">Байгууллага</th>
                      <th className="px-5 py-4">Байршил</th>
                      <th className="px-5 py-4">Эрсдэлийн оноо</th>
                      <th className="px-5 py-4">Түвшин</th>
                      <th className="px-5 py-4">Үнэлгээний огноо</th>
                      <th className="px-5 py-4">Шинэчлэх</th>
                      <th className="px-5 py-4 text-center">Дэлгэрэнгүй</th>
                      <th></th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredOrganizations.map((organization) => (
                      <tr
                        key={organization._id}
                        className="transition hover:bg-red-50/30 "
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                              <Building2 size={19} />
                            </div>

                            <div className="min-w-0">
                              <p className="wrap-break-word font-semibold text-gray-800">
                                {organization.name}
                              </p>
                              <a href={`https://amardaatgal.netlify.app/${organization._id}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:text-blue-700">
                                {organization._id}
                              </a>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="flex items-center gap-1.5 text-sm text-gray-600">
                            <MapPin
                              size={14}
                              className="shrink-0 text-gray-400"
                            />
                            {organization.location}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <ScoreBar score={organization.score} />
                        </td>

                        <td className="px-5 py-4">
                          <RiskBadge
                            level={getRiskLevel(organization.score)}
                          />
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">
                          {organization.date}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button type="button" onClick={() => {navigate(`/admin/update-assessment/${organization._id}`)}} className="flex justify-center items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                          >
                            <Pencil size={15} />  
                            Засах</button>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedOrganization(organization)
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                          >
                            <Eye size={15} />
                            Дэлгэрэнгүй
                          </button>
                        </td>
                        <td>
                          <button type="button" onClick={() => handleDelete(organization._id)} className='pr-6'> 
                            <Trash size={20} className="text-red-600 hover:text-red-800 texs-sm" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="space-y-3 p-3 md:hidden">
                {filteredOrganizations.map((organization) => (
                  <article
                    key={organization.id}
                    className="rounded-xl border border-gray-100 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                        <Building2 size={19} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="wrap-break-word font-semibold text-gray-900">
                          {organization.name}
                        </h3>

                        <a href={`https://amardaatgal.netlify.app/${organization._id}`} className="mt-1 text-xs text-blue-400">
                          {organization._id}
                        </a>

                        <div className="mt-3">
                          <RiskBadge
                            level={getRiskLevel(organization.score)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <ScoreBar score={organization.score} />
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
                      <span className="flex min-w-0 items-center gap-1 text-xs text-gray-500">
                        <MapPin size={13} className="shrink-0" />
                        <span className="wrap-break-word">
                          {organization.location}
                        </span>
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedOrganization(organization)
                        }
                        className="flex shrink-0 items-center gap-1 text-sm font-semibold text-red-600"
                      >
                        Дэлгэрэнгүй
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
                Байгууллага олдсонгүй
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Хайлтын үг эсвэл эрсдэлийн түвшнээ өөрчилж үзнэ үү.
              </p>

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
            </div>
          )}

          <div className="border-t border-gray-100 bg-gray-50/70 px-5 py-3 text-xs text-gray-400">
            {loading
              ? "Өгөгдөл ачаалж байна."
              : `Нийт ${organizations.length} байгууллагын бүртгэл.`}
          </div>
        </section>
      </div>

      <OrganizationDetails
        organization={selectedOrganization}
        onClose={() => setSelectedOrganization(null)}
      />
    </main>
  );
}
