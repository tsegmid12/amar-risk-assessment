
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import {
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  MapPin,
  Building2,
  ChevronRight,
  Image as ImageIcon,
  Activity,
  Flame,
  Zap,
  Droplets,
  Earth,
  ShieldAlert,
} from "lucide-react";

const RISK_LEVELS = [
  {
    max: 30,
    label: "Бага эрсдэл",
    legend: "0–30 Бага",
    color: "#059669",
    text: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    bar: "bg-emerald-500",
  },
  {
    max: 40,
    label: "Дундаж эрсдэл",
    legend: "31–40 Дунд",
    color: "#EAB308",
    text: "text-yellow-600",
    bg: "bg-yellow-50",
    border: "border-yellow-100",
    bar: "bg-yellow-500",
  },
  {
    max: 60,
    label: "Их эрсдэл",
    legend: "41–60 Их",
    color: "#F97316",
    text: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-100",
    bar: "bg-orange-500",
  },
  {
    max: Infinity,
    label: "Өндөр эрсдэл",
    legend: "61–100 Маш их",
    color: "#E11D48",
    text: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-100",
    bar: "bg-rose-500",
  },
];

const getRisk = (value) => {
  const score = Number(value) || 0;
  return RISK_LEVELS.find((level) => score <= level.max);
};

const cardClass =
  "rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md";

const getRiskIcon = (type = "") => {
  const name = String(type).toLowerCase();

  if (name.includes("гал")) return Flame;
  if (name.includes("цахилгаан")) return Zap;
  if (name.includes("сантехник") || name.includes("ус")) return Droplets;
  if (name.includes("газар хөдлөлт")) return Earth;
  if (name.includes("хулгай")) return ShieldAlert;

  return Activity;
};

export default function RiskAssessment() {
  const { id } = useParams();

  const [riskData, setRiskData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchRiskData = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await axios.get(
          `http://localhost:3000/riskAssessments/${id}`
        );

        if (cancelled) return;

        const result = Array.isArray(response.data)
          ? response.data
          : response.data
            ? [response.data]
            : [];

        setRiskData(result);
      } catch (err) {
        if (!cancelled) {
          console.error("Error fetching risk data:", err);
          setError("Эрсдэлийн мэдээллийг ачаалж чадсангүй.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchRiskData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const allRisks = riskData.flatMap((org) =>
    (Array.isArray(org.risks) ? org.risks : []).map((risk, index) => ({
      ...risk,
      _id: risk._id || `${org._id || "org"}-${index}`,
      name: risk.name || risk.type || "Нэргүй эрсдэл",
      type: risk.type || risk.name || "Бусад",
      score: Math.max(
        0,
        Math.min(100, Number(risk.score) || 0)
      ),
      organization:
        org.organizationName ||
        org.Organization ||
        org.organization?.name ||
        org.name ||
        "Байгууллага",
      image: risk.image || risk.imageUrl || risk.photo || "",
    }))
  );

  const averageScore = allRisks.length
    ? Math.round(
        allRisks.reduce((sum, risk) => sum + risk.score, 0) /
          allRisks.length
      )
    : 0;

  const averageRisk = getRisk(averageScore);

  const highRiskCount = allRisks.filter(
    (risk) => risk.score >= 61
  ).length;

  const safeCount = allRisks.filter(
    (risk) => risk.score <= 30
  ).length;

  const chartData = [
    {
      name: "Эрсдэл",
      value: averageScore,
      fill: averageRisk.color,
    },
  ];

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="h-8 w-64 rounded-lg bg-slate-200" />
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="h-80 rounded-2xl bg-slate-200" />
            <div className="h-80 rounded-2xl bg-slate-200" />
          </div>
          <div className="h-48 rounded-2xl bg-slate-200" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-4">
        <div className={`${cardClass} w-full max-w-md p-8 text-center`}>
          <AlertTriangle
            className="mx-auto mb-4 text-rose-500"
            size={40}
          />
          <h2 className="text-lg font-bold text-slate-800">
            Алдаа гарлаа
          </h2>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            Дахин ачаалах
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50/80 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <ShieldCheck size={17} className="text-rose-600" />
              <span>Эрсдэлийн удирдлага</span>
              <ChevronRight size={15} />
              <span className="text-slate-700">Үнэлгээ</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Эрсдэлийн үнэлгээ
            </h1>

            <p className="mt-1 text-sm text-slate-500 sm:text-base">
              Байгууллагын эрсдэлийн төлөв, үнэлгээний дэлгэрэнгүй
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
            <Activity size={17} className="text-rose-600" />
            <span className="text-sm font-semibold text-slate-700">
              {allRisks.length} эрсдэл бүртгэгдсэн
            </span>
          </div>
        </header>

        {/* Summary cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            icon={ShieldCheck}
            title="Нийт эрсдэл"
            value={allRisks.length}
            description="Бүртгэгдсэн эрсдэлийн тоо"
            iconClass="bg-blue-50 text-blue-600"
          />

          <SummaryCard
            icon={AlertTriangle}
            title="Өндөр эрсдэл"
            value={highRiskCount}
            description="61–100 оноотой эрсдэл"
            iconClass="bg-rose-50 text-rose-600"
          />

          <SummaryCard
            icon={TrendingUp}
            title="Бага эрсдэл"
            value={safeCount}
            description="0–30 оноотой эрсдэл"
            iconClass="bg-emerald-50 text-emerald-600"
          />
        </section>

        {/* Main dashboard */}
        <section className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.5fr)]">

          {/* Overall score */}
          <div className={`${cardClass} flex flex-col p-5 sm:p-7`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Нийт эрсдэлийн түвшин
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Бүх эрсдэлийн дундаж оноо
                </p>
              </div>

              <span className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
                <Activity size={20} />
              </span>
            </div>

            <div className="relative mx-auto mt-5 h-[220px] w-full max-w-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius="78%"
                  outerRadius="94%"
                  startAngle={90}
                  endAngle={-270}
                  barSize={18}
                >
                  <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    tick={false}
                  />
                  <RadialBar
                    dataKey="value"
                    cornerRadius={20}
                    background={{ fill: "#F1F5F9" }}
                    isAnimationActive
                    animationDuration={1000}
                  />
                </RadialBarChart>
              </ResponsiveContainer>

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold tracking-tight text-slate-900">
                  {averageScore}
                </span>
                <span className="mt-1 text-sm font-medium text-slate-400">
                  / 100 оноо
                </span>
              </div>
            </div>

            <div className="mt-1 flex flex-col items-center">
              <span
                className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${averageRisk.bg} ${averageRisk.text} ${averageRisk.border}`}
              >
                {averageRisk.label}
              </span>

              <p className="mt-3 text-center text-sm leading-6 text-slate-500">
                {allRisks.length
                  ? `Нийт ${allRisks.length} эрсдэлийн дундаж үзүүлэлт`
                  : "Одоогоор эрсдэлийн мэдээлэл байхгүй байна."}
              </p>
            </div>

            <div className="mt-auto pt-6">
              <div className="mb-2 flex justify-between text-xs text-slate-500">
                <span>0 — Бага</span>
                <span>100 — Маш их</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${averageScore}%`,
                    backgroundColor: averageRisk.color,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Individual risk levels */}
          <div className={`${cardClass} min-w-0 p-5 sm:p-7`}>
            <div className="mb-6 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Эрсдэлийн үзүүлэлтүүд
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Төрөл тус бүрийн эрсдэлийн оноо
                </p>
              </div>

              <span className="shrink-0 rounded-xl bg-rose-50 p-2.5 text-rose-600">
                <TrendingUp size={20} />
              </span>
            </div>

            {allRisks.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="s">
                {allRisks.map((item) => {
                  const risk = getRisk(item.score);
                  const Icon = getRiskIcon(item.type);

                  return (
                    <div key={item._id} className="group">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600 transition-colors group-hover:bg-rose-50 group-hover:text-rose-600">
                            <Icon size={18} />
                          </span>

                          <span className="truncate text-sm font-semibold text-slate-700 sm:text-base">
                            {item.name}
                          </span>
                        </div>

                        <span
                          className={`shrink-0 text-sm font-bold tabular-nums ${risk.text}`}
                        >
                          {item.score}
                          <span className="font-normal text-slate-400">
                            /100
                          </span>
                        </span>
                      </div>

                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ease-out ${risk.bar}`}
                          style={{ width: `${item.score}%` }}
                        />
                      </div>

                      <div className="mt-1.5 flex justify-end">
                        <span className={`text-xs ${risk.text}`}>
                          {risk.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-7 border-t border-slate-100 pt-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Эрсдэлийн ангилал
              </p>

              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {RISK_LEVELS.map((level) => (
                  <div
                    key={level.label}
                    className="flex items-center gap-2"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: level.color }}
                    />
                    <span className="text-xs text-slate-500">
                      {level.legend}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Detailed risks */}
        <section>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Эрсдэлийн дэлгэрэнгүй
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Эрсдэл тус бүрийн тайлбар, байршил болон үнэлгээ
              </p>
            </div>

            <span className="text-sm text-slate-400">
              {allRisks.length} бүртгэл
            </span>
          </div>

          {allRisks.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {allRisks.map((item) => (
                <RiskCard
                  key={item._id}
                  item={item}
                  onViewImage={setSelectedImage}
                />
              ))}
            </div>
          )}
        </section>

        {/* Image modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="relative w-full max-w-3xl rounded-2xl bg-white p-3 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute right-5 top-5 z-10 rounded-full bg-white/90 px-3 py-1.5 text-sm font-semibold text-slate-700 shadow hover:bg-white"
              >
                Хаах ✕
              </button>

              <img
                src={selectedImage}
                alt="Эрсдэлийн зураг"
                className="max-h-[80vh] w-full rounded-xl object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function SummaryCard({
  icon: Icon,
  title,
  value,
  description,
  iconClass,
}) {
  return (
    <div className={`${cardClass} flex items-center gap-4 p-5`}>
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconClass}`}>
        <Icon size={23} />
      </div>

      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </p>
        <p className="mt-0.5 text-xs text-slate-400">{description}</p>
      </div>
    </div>
  );
}

function RiskCard({ item, onViewImage }) {
  const risk = getRisk(item.score);
  const Icon = getRiskIcon(item.type);

  return (
    <article className={`${cardClass} min-w-0 p-5 sm:p-6`}>
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
          <Icon size={21} />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="break-words text-base font-bold text-slate-900 sm:text-lg">
            {item.name}
          </h3>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
            <Building2 size={14} className="shrink-0" />
            <span className="break-words">{item.organization}</span>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${risk.bg} ${risk.text} ${risk.border}`}
        >
          {risk.label}
        </span>
      </div>

      <div className="mt-5 rounded-xl bg-slate-50 p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-sm text-slate-500">
            Эрсдэлийн үнэлгээ
          </span>
          <span className={`text-lg font-bold tabular-nums ${risk.text}`}>
            {item.score}
            <span className="text-sm font-medium text-slate-400">
              /100
            </span>
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full transition-all duration-700 ${risk.bar}`}
            style={{ width: `${item.score}%` }}
          />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Тайлбар
          </p>
          <p className="break-words text-sm leading-6 text-slate-600">
            {item.description || "Тайлбар оруулаагүй байна."}
          </p>
        </div>

        {item.location && (
          <div className="flex items-start gap-2 border-t border-slate-100 pt-3">
            <MapPin
              size={16}
              className="mt-0.5 shrink-0 text-slate-400"
            />
            <span className="break-words text-sm text-slate-500">
              {item.location}
            </span>
          </div>
        )}
      </div>

      {item.image ? (
        <button
          onClick={() => onViewImage(item.image)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
        >
          <ImageIcon size={17} />
          Зураг харах
        </button>
      ) : null}
    </article>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-10 text-center">
      <div className="mb-3 rounded-2xl bg-slate-100 p-3 text-slate-400">
        <ShieldCheck size={28} />
      </div>
      <h3 className="font-semibold text-slate-700">
        Мэдээлэл байхгүй байна
      </h3>
      <p className="mt-1 text-sm text-slate-400">
        Эрсдэлийн мэдээлэл нэмэгдсэний дараа энд харагдана.
      </p>
    </div>
  );
}
