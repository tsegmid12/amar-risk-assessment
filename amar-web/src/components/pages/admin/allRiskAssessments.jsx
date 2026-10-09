
import { useMemo, useState } from "react";
import {
  Search,
  Building2,
  ShieldAlert,
  TrendingUp,
  ChevronDown,
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
} from "lucide-react";

const initialOrganizations = [
  {
    id: 1,
    name: "Баатарван амралт сувилал",
    registration: "ORG-001",
    location: "Төв аймаг",
    date: "2026-10-05",
    score: 36,
    status: "Дунд",
    risks: [
      { name: "Гал", score: 60, icon: Flame },
      { name: "Цахилгаан", score: 70, icon: Zap },
      { name: "Сантехник", score: 20, icon: Waves },
      { name: "Газар хөдлөлт", score: 20, icon: Mountain },
      { name: "Хулгай", score: 20, icon: ShieldAlert },
    ],
  },
  {
    id: 2,
    name: "Талын Өргөө ХХК",
    registration: "ORG-002",
    location: "Улаанбаатар",
    date: "2026-10-04",
    score: 68,
    status: "Маш их",
    risks: [
      { name: "Гал", score: 85, icon: Flame },
      { name: "Цахилгаан", score: 72, icon: Zap },
      { name: "Сантехник", score: 45, icon: Waves },
      { name: "Газар хөдлөлт", score: 50, icon: Mountain },
      { name: "Хулгай", score: 40, icon: ShieldAlert },
    ],
  },
  {
    id: 3,
    name: "Номин Трейд",
    registration: "ORG-003",
    location: "Дархан-Уул",
    date: "2026-10-03",
    score: 48,
    status: "Их",
    risks: [
      { name: "Гал", score: 55, icon: Flame },
      { name: "Цахилгаан", score: 48, icon: Zap },
      { name: "Сантехник", score: 35, icon: Waves },
      { name: "Газар хөдлөлт", score: 45, icon: Mountain },
      { name: "Хулгай", score: 58, icon: ShieldAlert },
    ],
  },
  {
    id: 4,
    name: "Их Монгол Констракшн",
    registration: "ORG-004",
    location: "Улаанбаатар",
    date: "2026-10-02",
    score: 25,
    status: "Бага",
    risks: [
      { name: "Гал", score: 25, icon: Flame },
      { name: "Цахилгаан", score: 30, icon: Zap },
      { name: "Сантехник", score: 18, icon: Waves },
      { name: "Газар хөдлөлт", score: 28, icon: Mountain },
      { name: "Хулгай", score: 24, icon: ShieldAlert },
    ],
  },
  {
    id: 5,
    name: "Хангай Фүүдс ХХК",
    registration: "ORG-005",
    location: "Орхон аймаг",
    date: "2026-10-01",
    score: 57,
    status: "Их",
    risks: [
      { name: "Гал", score: 65, icon: Flame },
      { name: "Цахилгаан", score: 62, icon: Zap },
      { name: "Сантехник", score: 42, icon: Waves },
      { name: "Газар хөдлөлт", score: 35, icon: Mountain },
      { name: "Хулгай", score: 48, icon: ShieldAlert },
    ],
  },
];

const filters = ["Бүгд", "Бага", "Дунд", "Их", "Маш их"];

const getRiskLevel = (score) => {
  if (score <= 30) return "Бага";
  if (score <= 40) return "Дунд";
  if (score <= 60) return "Их";
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

function RiskBadge({ level }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        riskStyles[level]?.badge || riskStyles["Дунд"].badge
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {level}
    </span>
  );
}

function ScoreBar({ score }) {
  const level = getRiskLevel(score);
  const style = riskStyles[level];

  return (
    <div className="min-w-28">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className={`text-sm font-bold ${style.text}`}>{score}</span>
        <span className="text-xs text-gray-400">/ 100</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${style.bar}`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
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
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
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

  const averageScore =
    organization.risks.length > 0
      ? Math.round(
          organization.risks.reduce((sum, risk) => sum + risk.score, 0) /
            organization.risks.length
        )
      : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-gray-100 bg-white p-5 sm:p-6">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Building2 size={24} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-gray-900">
                {organization.name}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {organization.registration}
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
                <span className="text-sm font-medium text-gray-400">/100</span>
              </p>
              <div className="mt-2">
                <RiskBadge level={getRiskLevel(organization.score)} />
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs text-gray-500">Эрсдэлийн төрөл</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {organization.risks.length}
              </p>
              <p className="mt-1 text-xs text-gray-400">Үнэлгээнд хамрагдсан</p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs text-gray-500">Байршил</p>
              <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                <MapPin size={15} className="text-red-500" />
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
                {organization.risks.length} үзүүлэлт
              </span>
            </div>

            <div className="space-y-4">
              {organization.risks.map((risk) => {
                const Icon = risk.icon;
                const level = getRiskLevel(risk.score);

                return (
                  <div
                    key={risk.name}
                    className="rounded-xl border border-gray-100 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-600">
                          <Icon size={18} />
                        </div>
                        <span className="text-sm font-semibold text-gray-800">
                          {risk.name}
                        </span>
                      </div>
                      <RiskBadge level={level} />
                    </div>
                    <ScoreBar score={risk.score} />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-red-100 bg-red-50/70 p-4">
            <div className="flex items-start gap-3">
              <Activity size={19} className="mt-0.5 shrink-0 text-red-600" />
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Эрсдэлийн үнэлгээний тайлбар
                </p>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  Үзүүлэлтүүдийн дундаж оноо {averageScore}. Нийт үнэлгээ болон
                  тус бүрийн эрсдэлийг харгалзан хамгаалалтын арга хэмжээг
                  төлөвлөнө.
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
  const [organizations] = useState(initialOrganizations);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Бүгд");
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [sortBy, setSortBy] = useState("score-desc");

  const filteredOrganizations = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return organizations
      .filter((organization) => {
        const matchesSearch =
          organization.name.toLowerCase().includes(query) ||
          organization.registration.toLowerCase().includes(query) ||
          organization.location.toLowerCase().includes(query);

        const matchesRisk =
          selectedFilter === "Бүгд" ||
          getRiskLevel(organization.score) === selectedFilter;

        return matchesSearch && matchesRisk;
      })
      .sort((a, b) =>
        sortBy === "score-asc" ? a.score - b.score : b.score - a.score
      );
  }, [organizations, searchTerm, selectedFilter, sortBy]);

  const highRiskCount = organizations.filter(
    (organization) => organization.score > 40
  ).length;

  const averageRisk = organizations.length
    ? Math.round(
        organizations.reduce((sum, organization) => sum + organization.score, 0) /
          organizations.length
      )
    : 0;

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
      <div className="mx-auto max-w-7xl">
        {/* Page heading */}
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

        {/* Summary */}
        <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Нийт байгууллага"
            value={organizations.length}
            subtitle="Бүх бүртгэлтэй байгууллага"
            icon={Building2}
            color="red"
          />
          <StatCard
            title="Дундаж эрсдэлийн оноо"
            value={`${averageRisk}/100`}
            subtitle={getRiskLevel(averageRisk) + " түвшин"}
            icon={TrendingUp}
            color="blue"
          />
          <StatCard
            title="Өндөр эрсдэлтэй"
            value={highRiskCount}
            subtitle="Оноо 40-өөс дээш"
            icon={ShieldAlert}
            color="orange"
          />
          <StatCard
            title="Бага эрсдэлтэй"
            value={
              organizations.filter((organization) => organization.score <= 30)
                .length
            }
            subtitle="Оноо 30 буюу түүнээс бага"
            icon={CheckCircle2}
            color="green"
          />
        </section>

        {/* Filters */}
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
                placeholder="Байгууллага, бүртгэлийн дугаар, байршил..."
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

        {/* Organization table */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-bold text-gray-900">
                Байгууллагын жагсаалт
              </h2>
              <p className="mt-1 text-xs text-gray-400">
                Байгууллага бүрийн сүүлийн үнэлгээ
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <FileText size={19} />
            </div>
          </div>

          {filteredOrganizations.length > 0 ? (
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
                      <th className="px-5 py-4 text-right">Үйлдэл</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredOrganizations.map((organization) => (
                      <tr
                        key={organization.id}
                        className="transition hover:bg-red-50/30"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                              <Building2 size={19} />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">
                                {organization.name}
                              </p>
                              <p className="mt-1 text-xs text-gray-400">
                                {organization.registration}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="flex items-center gap-1.5 text-sm text-gray-600">
                            <MapPin size={14} className="text-gray-400" />
                            {organization.location}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <ScoreBar score={organization.score} />
                        </td>

                        <td className="px-5 py-4">
                          <RiskBadge level={getRiskLevel(organization.score)} />
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">
                          {organization.date}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedOrganization(organization)}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                          >
                            <Eye size={15} />
                            Дэлгэрэнгүй
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
                        <h3 className="font-semibold text-gray-900">
                          {organization.name}
                        </h3>
                        <p className="mt-1 text-xs text-gray-400">
                          {organization.registration}
                        </p>
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

                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                      <span className="text-xs text-gray-500">
                        <MapPin size={13} className="mr-1 inline" />
                        {organization.location}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedOrganization(organization)}
                        className="flex items-center gap-1 text-sm font-semibold text-red-600"
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
                className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Шүүлт цэвэрлэх
              </button>
            </div>
          )}

          <div className="border-t border-gray-100 bg-gray-50/70 px-5 py-3 text-xs text-gray-400">
            Харуулж буй мэдээлэл нь жишээ өгөгдөл болно.
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