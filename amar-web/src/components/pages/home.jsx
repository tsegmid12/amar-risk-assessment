
import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import page from "../../assets/page.png";
import flame from "../../assets/flame.png";
import shield from "../../assets/shield.png";


import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import {
  ShieldCheck,
  Building2,
  TrendingUp,
  Car,
  ChevronDown,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

const RISK_LEVELS = [
  { max: 30, label: "Бага эрсдэл", color: "#059669" },
  { max: 40, label: "Дундаж эрсдэл", color: "#EAB308" },
  { max: 60, label: "Их эрсдэл", color: "#F97316" },
  { max: Infinity, label: "Өндөр эрсдэл", color: "#E11D48" },
];

const getRiskLevel = (score) =>
  RISK_LEVELS.find((level) => Number(score) <= level.max) ||
  RISK_LEVELS[0];

const cardClass = "rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-md";

const categories = [
  "Бүгд",
  "Эд хөрөнгө",
  "Хариуцлага",
  "Тээвэр",
];

export default function Home() {
  const { id } = useParams();

  const [riskAssessment, setRiskAssessment] = useState(null);
  const [active, setActive] = useState("Бүгд");
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRiskAssessment = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `http://localhost:3000/riskAssessments/${id}`
      );
      setRiskAssessment(response.data);
    } catch (err) {
      console.error("Error fetching risk assessment:", err);
      setError("Эрсдэлийн мэдээллийг ачаалж чадсангүй.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiskAssessment();
  }, [id]);

  const data = useMemo(() => {
    const risks = Array.isArray(riskAssessment?.risks)
      ? riskAssessment.risks
      : [];

    return risks.map((item, index) => ({
      id: item._id || item.id || index,
      name: item.type || item.name || "Бусад эрсдэл",
      value: Math.max(
        0,
        Math.min(100, Number(item.score) || 0)
      ),
    }));
  }, [riskAssessment]);

  const maxValue = data.reduce(
    (max, item) => (item.value > max.value ? item : max),
    { name: "Бүртгэлгүй", value: 0 }
  );

  const averageValue = data.length
    ? Math.round(
        data.reduce((sum, item) => sum + item.value, 0) /
          data.length
      )
    : 0;

    const selectedInsurance = Array.isArray(riskAssessment?.selectedInsurance)
    ? riskAssessment.selectedInsurance
    : [];

  const organizationName =
    riskAssessment?.organizationName ||
    riskAssessment?.organization?.name ||
    riskAssessment?.organization ||
    "Байгууллага";

  const filteredData = selectedInsurance.filter(
    (item) => active === "Бүгд" || item.category === active
  );

  const highRiskCount = data.filter(
    (item) => item.value >= 61
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <LoaderCircle
            size={38}
            className="mx-auto animate-spin text-red-500"
          />
          <p className="mt-4 text-sm font-medium text-slate-500">
            Мэдээлэл ачаалж байна...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-4">
        <div className={`${cardClass} w-full max-w-md p-8 text-center`}>
          <AlertTriangle
            size={40}
            className="mx-auto text-red-500"
          />
          <h2 className="mt-4 text-xl font-bold text-slate-800">
            Алдаа гарлаа
          </h2>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
          <button
            onClick={fetchRiskAssessment}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
          >
            <RefreshCw size={16} />
            Дахин оролдох
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen overflow-x-clip bg-[#F7F8FC] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8">

        {/* PAGE HEADER */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <ShieldCheck size={17} className="text-red-500" />
              <span>AMAR</span>
              <span className="text-slate-300">/</span>
              <span>Даатгалын санал</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              Эрсдэлийн тойм
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
              Байгууллагын эрсдэлийн үнэлгээнд үндэслэсэн даатгалын санал.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3">
            <Building2 size={18} className="text-red-500" />
            <span className="max-w-55 truncate text-sm font-semibold text-slate-700">
              {organizationName}
            </span>
          </div>
        </header>

        {/* ORGANIZATION AND CHART */}
        <section className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-2">

          {/* ORGANIZATION SUMMARY */}
          <div className={`${cardClass} p-5 sm:p-7`}>
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="h-12 w-1.5 shrink-0 rounded-full bg-red-500 sm:h-14" />

              <div className="min-w-0">
                <h2 className="break-words text-xl font-bold tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">
                  {organizationName}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Танай байгууллагын эрсдэлийг хамгаалах даатгалын зөвлөмж
                </p>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3 xl:mt-10">
              <StatCard
                icon={page}
                iconAlt="Санал"
                iconBg="bg-emerald-500"
                title="Санал болгосон"
                value={selectedInsurance.length}
                subtitle="Даатгалын санал"
                accent="text-emerald-700"
              />

              <StatCard
                icon={flame}
                iconAlt="Эрсдэл"
                iconBg="bg-red-500"
                title="Хамгийн өндөр"
                value={maxValue.value}
                suffix="/100"
                subtitle={maxValue.name}
                accent="text-rose-600"
              />

              <StatCard
                icon={shield}
                iconAlt="Дундаж"
                iconBg="bg-yellow-500"
                title="Дундаж эрсдэл"
                value={averageValue}
                suffix="/100"
                subtitle={getRiskLevel(averageValue).label}
                accent="text-yellow-600"
              />
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="rounded-lg bg-white p-2 text-red-500 shadow-sm">
                <FileCheck2 size={19} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Үнэлгээний мэдээлэл
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Нийт {data.length} төрлийн эрсдэлийг үнэлгээнд хамруулсан.
                  {highRiskCount > 0
                    ? ` ${highRiskCount} төрлийн өндөр эрсдэл илэрсэн.`
                    : " 61 ба түүнээс дээш оноотой эрсдэл одоогоор байхгүй."}
                </p>
              </div>
            </div>
          </div>

          {/* RISK CHART */}
          <div className={`${cardClass} min-w-0 p-5 sm:p-7`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  Эрсдэлийн үнэлгээ
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Төрөл тус бүрийн эрсдэлийн онооны харьцуулалт
                </p>
              </div>

              <div className="shrink-0 rounded-xl bg-red-50 px-3 py-2">
                <TrendingUp size={20} className="text-red-500" />
              </div>
            </div>

            {data.length > 0 ? (
              <div className="mt-5 h-64 w-full min-w-0 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data}
                    margin={{
                      top: 12,
                      right: 4,
                      left: -18,
                      bottom: 8,
                    }}
                    barCategoryGap="28%"
                  >
                    <CartesianGrid
                      strokeDasharray="4 5"
                      vertical={false}
                      stroke="#E9EDF4"
                    />

                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "#64748B",
                        fontSize: 11,
                      }}
                      tickMargin={10}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                      height={55}
                    />

                    <YAxis
                      domain={[0, 100]}
                      ticks={[0, 20, 40, 60, 80, 100]}
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "#94A3B8",
                        fontSize: 11,
                      }}
                    />

                    <Tooltip
                      cursor={{ fill: "#F8FAFC" }}
                      formatter={(value) => [`${value}/100`, "Оноо"]}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #E2E8F0",
                        boxShadow: "0 8px 25px rgba(15,23,42,0.08)",
                        fontSize: 12,
                      }}
                    />

                    <Bar
                      dataKey="value"
                      name="Эрсдэлийн оноо"
                      radius={[7, 7, 0, 0]}
                      maxBarSize={42}
                      animationDuration={800}
                    >
                      {data.map((item) => (
                        <Cell
                          key={item.id}
                          className={`transition-colors fill-gray-300 duration-300 ${item.value >= 61 ? "hover:fill-red-600" : item.value >= 41 ? "hover:fill-orange-500" : item.value >=31 ? "hover:fill-yellow-500" : "hover:fill-emerald-500"}`}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState message="График харуулах эрсдэлийн мэдээлэл алга." />
            )}

            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-3 border-t border-slate-100 pt-5">
              {RISK_LEVELS.map((level, index) => (
                <div
                  key={level.label}
                  className="flex items-center gap-2"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: level.color }}
                  />
                  <span className="text-xs text-slate-500">
                    {["0–30 Бага", "31–40 Дунд", "41–60 Их", "61–100 Маш их"][index]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* INSURANCE SECTION */}
        <section className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-red-500">
                <ShieldCheck size={17} />
                <span>Танд зориулсан</span>
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Эрсдэлийг хамгаалах даатгалууд
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
                Эрсдэлийн үнэлгээнд суурилсан даатгалын саналууд
              </p>
            </div>

            <span className="w-fit rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600">
              {selectedInsurance.length} даатгал
            </span>
          </div>

          {/* CATEGORY FILTER */}
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
            {categories.map((category) => {
              const selected = active === category;

              return (
                <button
                  key={category}
                  onClick={() => {
                    setActive(category);
                    setExpanded(null);
                  }}
                  className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    selected
                      ? "bg-red-500 text-white shadow-md shadow-red-500/15"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {/* INSURANCE LIST */}
          <div className="space-y-3">
            {filteredData.map((item) => {
              const isExpanded = expanded === item._id || item.id;

              return (
                <article
                  key={item._id || item.id}
                  className={`overflow-hidden rounded-2xl border bg-white transition-all duration-300 ${
                    isExpanded
                      ? "border-red-200 shadow-md shadow-red-500/5"
                      : "border-slate-200/80 shadow-sm hover:border-slate-300 hover:shadow-md"
                  }`}
                >
                  {/* CARD HEADER */}
                  <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                    <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                          isExpanded
                            ? "bg-red-500"
                            : "bg-red-50"
                        }`}
                      >
                        {item.category === "Эд хөрөнгө" ? (<Building2 className={`text-red-400 ${isExpanded ? "text-white" : ""}`}/>) : item.category === "Хариуцлага" ? (<ShieldCheck className={`text-red-400 ${isExpanded ? "text-white" : ""}`}/>) : item.category === "Тээвэр" ? (<Car className="text-red-400"/>) : (<ShieldCheck className="text-red-400"/>)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="wrap-break-word text-base font-bold text-slate-900 sm:text-lg">
                            {item.name}
                          </h3>

                          <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500">
                            {item.category}
                          </span>
                        </div>

                        <p className="mt-1.5 text-sm leading-6 text-slate-500">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <button
                      aria-expanded={isExpanded}
                      onClick={() =>
                        setExpanded(isExpanded ? null : item._id || item.id)
                      }
                      className={`flex w-full shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all sm:w-auto ${
                        isExpanded
                          ? "bg-red-50 text-red-600"
                          : "border border-slate-200 text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                      }`}
                    >
                      {isExpanded ? "Хураах" : "Дэлгэрэнгүй"}
                      <ChevronDown
                        size={17}
                        className={`transition-transform duration-300 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {/* ANIMATED DETAILS */}
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isExpanded
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                    aria-hidden={!isExpanded}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div className="border-t border-slate-100 bg-slate-50/70 p-4 sm:p-5">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 whitespace-pre-line">
                          <DetailCard
                            title="Хамрах хүрээ"
                            text={item.coverage.join("\n")}
                            icon={<CheckCircle2 size={19} />}
                            color="text-red-600"
                            delay="delay-100"
                            duration={700}
                            translateX="-translate-x-300"
                            expanded={isExpanded}
                          />

                          <DetailCard
                            title="Нэмэлт үйлчилгээ"
                            text={item.additionalServices.join("\n")}
                            icon={<ShieldCheck size={19} />}
                            color="text-emerald-600"
                            delay="delay-600"
                            duration={500}
                            translateX="translate-x-100"
                            expanded={isExpanded}
                          />
                        </div>

                        <div
                          className={`mt-4 flex flex-col gap-3 rounded-xl border justify-between border-emerald-100  p-4 transition-all duration-700 sm:flex-row sm:items-centersm:justify-between ${
                            isExpanded
                              ? "translate-y-0 opacity-100 delay-100"
                              : "translate-y-100 opacity-0"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="rounded-lg bg-white p-2 text-emerald-600">
                              <CheckCircle2 size={19} />
                            </div>

                            <div>
                              <p className="font-bold text-emerald-900">
                                Танд санал болгож байна
                              </p>
                              <p className="mt-1 text-sm leading-5 text-emerald-800">
                                Эрсдэлийн үнэлгээнд үндэслэн сонгогдсон даатгал
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() =>
                              window.location.assign(`/${id}/additional`)
                            }
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 sm:w-auto"
                          >
                            Нэмэлт үйлчилгээ
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}

            {filteredData.length === 0 && (
              <EmptyState message="Энэ ангилалд тохирох даатгал одоогоор байхгүй байна." />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  iconAlt,
  iconBg,
  title,
  value,
  suffix = "",
  subtitle,
  accent,
}) {
  return (
    <div className="group min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
        >
          <img
            src={icon}
            alt={iconAlt}
            className="h-5 w-5 object-contain"
          />
        </div>

        <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400 sm:text-xs">
          Үзүүлэлт
        </span>
      </div>

      <p className="mt-4 text-xs font-medium leading-5 text-slate-500 sm:text-sm">
        {title}
      </p>

      <div className="mt-1 flex flex-wrap items-baseline gap-1">
        <span className={`text-3xl font-bold tracking-tight ${accent}`}>
          {value}
        </span>
        {suffix && (
          <span className="text-xs font-medium text-slate-400">
            {suffix}
          </span>
        )}
      </div>

      <p className="mt-2 truncate text-xs text-slate-400" title={subtitle}>
        {subtitle}
      </p>
    </div>
  );
}

function DetailCard({
  title,
  text,
  icon,
  color,
  delay,
  translateX,
  expanded,
}) {
  return (
    <div
      className={`rounded-xl border border-slate-200/70 bg-white p-4 transition-all duration-500 ${delay} ${
        expanded
          ? "translate-x-0 translate-y-0 opacity-100"
          : `${translateX} opacity-0`
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={color}>{icon}</span>
        <h4 className="text-sm font-bold text-slate-800">
          {title}
        </h4>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        {text}
      </p>
    </div>
  );
}

function EmptyState({ message = "Мэдээлэл олдсонгүй." }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
        <ShieldCheck size={25} />
      </div>

      <p className="mt-3 text-sm text-slate-500">{message}</p>
    </div>
  );
}
