import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
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
  X,
  Printer,
} from "lucide-react";

const RISK_LEVELS = [
  { max: 30, label: "Бага эрсдэл", color: "#059669" },
  { max: 40, label: "Дундаж эрсдэл", color: "#EAB308" },
  { max: 60, label: "Их эрсдэл", color: "#F97316" },
  { max: Infinity, label: "Өндөр эрсдэл", color: "#E11D48" },
];

const categories = ["Бүгд", "Эд хөрөнгө", "Хариуцлага", "Тээвэр"];

const cardClass =
  "rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-md";

const getRiskLevel = (score) =>
  RISK_LEVELS.find((level) => Number(score) <= level.max) || RISK_LEVELS[0];

const formatMoney = (value) =>
  `${(Number(value) || 0).toLocaleString("mn-MN")} ₮`;

const getArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) return [value];
  return [];
};

const getOrganizationName = (organization) => {
  if (typeof organization === "string") return organization;
  return organization?.name || organization?.organizationName || "Байгууллага";
};

/* =========================================================
   INVOICE MODAL
   Portal-оор document.body-д гаргана. Ингэснээр хэвлэх үед
   бусад бүх контентыг (#root) display:none болгож, зөвхөн
   нэхэмжлэл 1 хуудсан дээр гарна.
========================================================= */

function Invoice({ items = [], organizationName, onClose }) {
  const totalAmount = items.reduce(
    (sum, item) => sum + (Number(item.feeAmount) || 0),
    0
  );

  const handlePrint = () => {
    window.print();
  };

  return createPortal(
    <div id="invoice-print-root">
      <style>{`
        @media print {
          /* body-ийн бусад бүх зүйлийг (#root, sidebar...) бүрэн нууна */
          body > *:not(#invoice-print-root) {
            display: none !important;
          }

          html,
          body {
            height: auto !important;
            overflow: visible !important;
            background: #fff !important;
          }

          #invoice-print-root > div {
            position: static !important;
            display: block !important;
            inset: auto !important;
            padding: 0 !important;
            background: #fff !important;
            backdrop-filter: none !important;
          }

          #invoice-print {
            position: static !important;
            width: 100% !important;
            max-width: none !important;
            max-height: none !important;
            overflow: visible !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            break-inside: avoid;
          }

          #invoice-print * {
            overflow: visible !important;
          }

          .invoice-no-print {
            display: none !important;
          }

          @page {
            size: A4;
            margin: 15mm;
          }
        }
      `}</style>

      <div
        className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <section
          id="invoice-print"
          className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        >
          {/* MODAL HEADER */}
          <div className="invoice-no-print flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-7">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-red-500">
                <FileCheck2 size={17} />
                AMAР
              </div>
              <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
                Төлбөрийн нэхэмжлэл
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Даатгалын төлбөрийн дэлгэрэнгүй
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Хаах"
              className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={22} />
            </button>
          </div>

          {/* INVOICE CONTENT */}
          <div className="overflow-y-auto p-5 sm:p-7">
            {/* Хэвлэх үед гарах гарчиг */}
            <div className="mb-6 hidden print:block">
              <p className="text-sm font-semibold text-red-500">
                AMAR Insurance
              </p>
              <h2 className="text-2xl font-bold text-slate-900">
                Төлбөрийн нэхэмжлэл
              </h2>
            </div>

            <div className="mb-7 flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Нэхэмжлэл хүлээн авагч
                </p>
                <h3 className="mt-2 text-xl font-bold text-slate-900">
                  {organizationName || "Байгууллага"}
                </h3>
              </div>

              <div className="sm:text-right">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Баримтын төрөл
                </p>
                <p className="mt-2 font-bold text-slate-800">
                  Даатгалын төлбөрийн нэхэмжлэл
                </p>
                <p className="mt-1 text-sm text-slate-500">AMAR Insurance</p>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-base font-bold text-slate-900">
                Нэхэмжилсэн даатгалууд
              </h3>

              {items.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[540px] border-collapse text-sm">
                    <thead>
                      <tr className="border-y border-slate-200 bg-slate-50 text-slate-500">
                        <th className="p-3 text-left font-semibold">№</th>
                        <th className="p-3 text-left font-semibold">
                          Даатгалын нэр
                        </th>
                        <th className="p-3 text-right font-semibold">
                          Үнэлгээ
                        </th>
                        <th className="p-3 text-right font-semibold">
                          Хураамж
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {items.map((item, index) => (
                        <tr
                          key={item._id || index}
                          className="border-b border-slate-100"
                        >
                          <td className="p-3 text-slate-500">{index + 1}</td>
                          <td className="p-3 font-semibold text-slate-800">
                            {item.insuranceId?.name || "Даатгал"}
                          </td>
                          <td className="whitespace-nowrap p-3 text-right text-slate-600">
                            {formatMoney(item.valuation)}
                          </td>
                          <td className="whitespace-nowrap p-3 text-right font-semibold text-slate-900">
                            {formatMoney(item.feeAmount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">
                  Нэхэмжлэх даатгалын мэдээлэл байхгүй байна.
                </p>
              )}
            </div>

            <div className="mt-7 rounded-xl border border-red-100 bg-red-50 p-5">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    Нийт төлөх дүн
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {items.length} даатгалын бүтээгдэхүүний нийт хураамж
                  </p>
                </div>

                <p className="text-2xl font-bold text-red-600 sm:text-3xl">
                  {formatMoney(totalAmount)}
                </p>
              </div>
            </div>

            <div className="mt-7 border-t border-slate-200 pt-5">
              <p className="text-xs leading-5 text-slate-400">
                Энэхүү нэхэмжлэл нь байгууллагад санал болгосон даатгалын
                бүтээгдэхүүнүүдийн хураамжийн нэгтгэл болно.
              </p>
            </div>
          </div>

          {/* MODAL FOOTER */}
          <div className="invoice-no-print flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 p-5 sm:flex-row sm:justify-end sm:px-7">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Хаах
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
            >
              <Printer size={17} />
              Нэхэмжлэл хэвлэх
            </button>
          </div>
        </section>
      </div>
    </div>,
    document.body
  );
}

/* =========================================================
   HOME
========================================================= */

export default function Home() {
  const { id } = useParams();
  const API_URL = import.meta.env.VITE_API_URL;

  const [riskAssessment, setRiskAssessment] = useState(null);
  const [priceOffer, setPriceOffer] = useState(null);

  const [pageType, setPageType] = useState(null);
  const [active, setActive] = useState("Бүгд");
  const [expanded, setExpanded] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [invoice, setInvoice] = useState(false);

  /* ---------------------------------------------------------
     FETCH DATA
  --------------------------------------------------------- */

  const fetchData = async () => {
    if (!id) {
      setError(
        "Энэ хуудсыг нээхэд шаардлагатай мэдээлэл холбоосод байхгүй байна. Та өөрт илгээсэн холбоосоор дахин нэвтэрнэ үү."
      );
      setLoading(false);
      return;
    }

    if (!API_URL) {
      setError("Серверийн хаяг тохируулагдаагүй байна.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    setRiskAssessment(null);
    setPriceOffer(null);
    setPageType(null);

    // Эхлээд эрсдэлийн үнэлгээний API-г шалгана.
    try {
      const response = await axios.get(`${API_URL}/riskAssessments/${id}`);

      if (response.data) {
        setRiskAssessment(response.data);
        setPageType("risk");
        setLoading(false);
        return;
      }
    } catch (riskError) {
      console.log(
        "Эрсдэлийн үнэлгээ олдсонгүй. Үнийн саналыг шалгаж байна.",
        riskError.response?.status
      );
    }

    // Эрсдэлийн үнэлгээ олдоогүй бол үнийн саналын API-г шалгана.
    try {
      const response = await axios.get(`${API_URL}/priceOffers/${id}`);

      if (response.data) {
        setPriceOffer(response.data);
        setPageType("price");
      } else {
        throw new Error("Үнийн саналын мэдээлэл хоосон байна.");
      }
    } catch (priceError) {
      console.error("Мэдээлэл татахад алдаа гарлаа:", priceError);

      setError(
        "Энэ холбоосоор холбогдох мэдээлэл олдсонгүй. Та өөрт илгээсэн холбоос зөв эсэхийг шалгана уу."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /* ---------------------------------------------------------
     RISK DATA
  --------------------------------------------------------- */


  const data = useMemo(() => {
    const risks = Array.isArray(riskAssessment?.risks)
      ? riskAssessment.risks
      : [];

    return risks.map((item, index) => ({
      id: item._id || item.id || index,
      name: item.type || item.name || "Бусад эрсдэл",
      value: Math.max(0, Math.min(100, Number(item.score) || 0)),
    }));
  }, [riskAssessment]);

  const maxValue = data.reduce(
    (max, item) => (item.value > max.value ? item : max),
    { name: "Бүртгэлгүй", value: 0 }
  );

  const averageValue = data.length
    ? Math.round(data.reduce((sum, item) => sum + item.value, 0) / data.length)
    : 0;

    const selectedInsurance = Array.isArray(riskAssessment?.selectedInsurance)
    ? riskAssessment.selectedInsurance
    : [];

const filteredData = selectedInsurance.filter((item) => {
  const category = item.category;

  return (
    active === "Бүгд" ||
    (Array.isArray(category)
      ? category.includes(active)
      : category === active)
  );
});

  const organizationName =
    riskAssessment?.organizationName ||
    getOrganizationName(riskAssessment?.organization);



  const highRiskCount = data.filter((item) => item.value >= 61).length;

  /* ---------------------------------------------------------
     PRICE OFFER DATA
  --------------------------------------------------------- */

  const priceOfferItems = Array.isArray(priceOffer?.priceOffers)
    ? priceOffer.priceOffers
    : [];

  const priceOfferOrganization = getOrganizationName(priceOffer?.organization);

  const totalFee = priceOfferItems.reduce(
    (sum, item) => sum + (Number(item.feeAmount) || 0),
    0
  );

  /* ---------------------------------------------------------
     LOADING
  --------------------------------------------------------- */

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

  /* ---------------------------------------------------------
     ERROR
  --------------------------------------------------------- */

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-4">
        <div className={`${cardClass} w-full max-w-md p-8 text-center`}>
          <AlertTriangle size={40} className="mx-auto text-red-500" />

          <h2 className="mt-4 text-xl font-bold text-slate-800">
            Мэдээлэл олдсонгүй
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">{error}</p>

          <button
            type="button"
            onClick={fetchData}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
          >
            <RefreshCw size={16} />
            Дахин оролдох
          </button>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------
     RENDER
  --------------------------------------------------------- */

  return pageType === "risk" ? (
    /* =======================================================
       RISK ASSESSMENT PAGE
    ======================================================= */

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
                <h2 className="wrap-break-word text-xl font-bold tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">
                  {organizationName}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Танай байгууллагын эрсдэлийг хамгаалах даатгалын зөвлөмж
                </p>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-3 gap-3 sm:mt-10">
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
                    margin={{ top: 12, right: 4, left: -18, bottom: 8 }}
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
                      tick={{ fill: "#64748B", fontSize: 11 }}
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
                      tick={{ fill: "#94A3B8", fontSize: 11 }}
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
                      {data.map((item) => {
                        const fill =
                          item.value >= 61
                            ? "#E11D48"
                            : item.value >= 41
                              ? "#F97316"
                              : item.value >= 31
                                ? "#EAB308"
                                : "#059669";

                        return (
                          <Cell
                            key={item.id}
                            fill={fill}
                            className="transition-opacity hover:opacity-80"
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState message="График харуулах эрсдэлийн мэдээлэл алга." />
            )}

            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-3 border-t border-slate-100 pt-5">
              {RISK_LEVELS.map((level, index) => (
                <div key={level.label} className="flex items-center gap-2">
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
                  type="button"
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
            {filteredData.map((item, index) => {
              const itemId = item._id || item.id || index;
              const isExpanded = expanded === itemId;

              return (
                <article
                  key={itemId}
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
                          isExpanded ? "bg-red-500" : "bg-red-50"
                        }`}
                      >
                        {item.category === "Эд хөрөнгө" ? (
                          <Building2
                            className={isExpanded ? "text-white" : "text-red-400"}
                          />
                        ) : item.category === "Хариуцлага" ? (
                          <ShieldCheck
                            className={isExpanded ? "text-white" : "text-red-400"}
                          />
                        ) : item.category === "Тээвэр" ? (
                          <Car
                            className={isExpanded ? "text-white" : "text-red-400"}
                          />
                        ) : (
                          <ShieldCheck
                            className={isExpanded ? "text-white" : "text-red-400"}
                          />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="wrap-break-word text-base font-bold text-slate-900 sm:text-lg">
                            {item.name || "Даатгалын нэр"}
                          </h3>

                          <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500">
                            {item.category || "Бусад"}
                          </span>
                        </div>

                        <p className="mt-1.5 text-sm leading-6 text-slate-500">
                          {item.description || "Тайлбар оруулаагүй байна."}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      onClick={() => setExpanded(isExpanded ? null : itemId)}
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
                        <div className="grid grid-cols-1 gap-3 whitespace-pre-line md:grid-cols-2">
                          <DetailCard
                            title="Хамрах хүрээ"
                            text={getArray(item.coverage).join("\n")}
                            icon={<CheckCircle2 size={19} />}
                            color="text-red-600"
                            delay="delay-100"
                            translateX="-translate-x-8"
                            expanded={isExpanded}
                          />

                          <DetailCard
                            title="Нэмэлт үйлчилгээ"
                            text={getArray(item.additionalServices).join("\n")}
                            icon={<ShieldCheck size={19} />}
                            color="text-emerald-600"
                            delay="delay-200"
                            translateX="translate-x-8"
                            expanded={isExpanded}
                          />
                        </div>

                        <div
                          className={`mt-4 flex flex-col justify-between gap-3 rounded-xl border border-emerald-100 p-4 transition-all duration-500 sm:flex-row sm:items-center ${
                            isExpanded
                              ? "translate-y-0 opacity-100"
                              : "translate-y-4 opacity-0"
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
                            type="button"
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
  ) : (
    /* =======================================================
       PRICE OFFER PAGE
    ======================================================= */

    <main className="min-h-screen overflow-x-clip bg-[#F7F8FC] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* HEADER */}
        <header>
          <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
            <ShieldCheck size={17} className="text-red-500" />
            <span>AMAR</span>
            <span className="text-slate-300">/</span>
            <span>Даатгалын үнийн санал</span>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Даатгалын үнийн санал
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
                Танай байгууллагад зориулан боловсруулсан даатгалын үнийн санал.
              </p>
            </div>

            <div className="flex w-fit items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5">
              <CheckCircle2 size={17} className="text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700">
                Үнийн санал бэлэн
              </span>
            </div>
          </div>
        </header>

        {/* ORGANIZATION CARD */}
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="bg-linear-to-r from-red-500 to-red-300 p-5 text-white sm:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                <Building2 size={25} />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium text-red-100">
                  Үнийн санал хүлээн авагч байгууллага
                </p>

                <h2 className="mt-1 wrap-break-word text-xl font-bold sm:text-2xl">
                  {priceOfferOrganization}
                </h2>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 divide-x divide-slate-100 sm:grid-cols-3">
            <div className="p-5">
              <p className="text-xs font-medium text-slate-400">Саналын төрөл</p>

              <p className="mt-2 font-bold text-slate-800">Даатгал</p>
            </div>

            <div className="p-5">
              <p className="text-xs font-medium text-slate-400">
                Нийт бүтээгдэхүүн
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900">
                {priceOfferItems.length}
              </p>
            </div>

            <div className="col-span-2 border-t border-slate-100 p-5 sm:col-span-1 sm:border-t-0">
              <p className="text-xs font-medium text-slate-400">Нийт хураамж</p>

              <p className="mt-2 text-xl font-bold text-slate-900">
                {formatMoney(totalFee)}
              </p>
            </div>
          </div>
        </section>

        {/* INSURANCE LIST */}
        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Санал болгож буй даатгалууд
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Байгууллагад зориулсан даатгалын бүтээгдэхүүнүүд
              </p>
            </div>

            <span className="w-fit rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-600 ring-1 ring-slate-200">
              {priceOfferItems.length} бүтээгдэхүүн
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {priceOfferItems.map((item, index) => {
              const itemId = item._id || index;
              const isExpanded = expanded === itemId;

              return (
                <article
                  key={itemId}
                  className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-lg"
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 transition group-hover:bg-red-500 group-hover:text-white">
                        <ShieldCheck size={23} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <button
                          type="button"
                          aria-expanded={isExpanded}
                          onClick={() => setExpanded(isExpanded ? null : itemId)}
                          className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left transition hover:bg-linear-to-l hover:from-red-50 hover:to-white"
                        >
                          <div className="min-w-0">
                            <span className="text-xs font-semibold text-red-500">
                              ДААТГАЛ #{index + 1}
                            </span>

                            <h3 className="mt-1 wrap-break-word text-lg font-bold text-slate-900">
                              {item.insuranceId?.name || "Даатгалын нэр"}
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                              {item.insuranceId?.category || "Даатгал"}
                            </p>
                          </div>

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition group-hover:bg-red-500 group-hover:text-white">
                            <ChevronDown
                              className={`transition-transform duration-300 ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                        </button>

                        {item.insuranceId?.description && (
                          <p
                            className={`mt-3 text-sm leading-6 text-slate-500 ${
                              isExpanded ? "" : "line-clamp-2"
                            }`}
                          >
                            {item.insuranceId.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* INSURANCE DETAILS */}
                    <div
                      className={`grid transition-all duration-300 ${
                        isExpanded
                          ? "mt-4 grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                          <p className="text-sm font-bold text-slate-800">
                            Даатгалын дэлгэрэнгүй
                          </p>

                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <div>
                              <p className="text-xs font-semibold text-slate-500">
                                Хамрах хүрээ
                              </p>

                              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                                {getArray(item.insuranceId?.coverage).length ? (
                                  getArray(item.insuranceId?.coverage).map(
                                    (value, i) => (
                                      <li key={i} className="flex gap-2">
                                        <CheckCircle2
                                          size={15}
                                          className="mt-0.5 shrink-0 text-emerald-500"
                                        />
                                        {value}
                                      </li>
                                    )
                                  )
                                ) : (
                                  <li className="text-slate-400">
                                    Мэдээлэл байхгүй
                                  </li>
                                )}
                              </ul>
                            </div>

                            <div>
                              <p className="text-xs font-semibold text-slate-500">
                                Нэмэлт үйлчилгээ
                              </p>

                              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                                {getArray(item.insuranceId?.additionalServices)
                                  .length ? (
                                  getArray(
                                    item.insuranceId?.additionalServices
                                  ).map((value, i) => (
                                    <li key={i} className="flex gap-2">
                                      <CheckCircle2
                                        size={15}
                                        className="mt-0.5 shrink-0 text-emerald-500"
                                      />
                                      {value}
                                    </li>
                                  ))
                                ) : (
                                  <li className="text-slate-400">
                                    Мэдээлэл байхгүй
                                  </li>
                                )}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* PRICE DETAILS */}
                    <div className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-4">
                      <div>
                        <p className="text-xs font-medium text-slate-500">
                          Байгууллагын үнэлгээ
                        </p>

                        <p className="mt-2 text-xl font-bold text-green-500 sm:text-2xl">
                          {formatMoney(item.valuation)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-slate-500">
                          Хураамжийн хувь
                        </p>

                        <p className="mt-2 text-xl font-bold tracking-tight text-red-600 sm:text-2xl">
                          {(Number(item.feePercentage) || 0).toLocaleString(
                            "mn-MN"
                          )}
                          %
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-slate-500">
                          Даатгалын хураамж
                        </p>

                        <p className="mt-2 text-xl font-bold tracking-tight text-red-600 sm:text-2xl">
                          {formatMoney(item.feeAmount)}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}

            {priceOfferItems.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-12 text-center">
                <ShieldCheck size={35} className="mx-auto text-slate-300" />

                <p className="mt-3 font-semibold text-slate-700">
                  Даатгалын мэдээлэл байхгүй байна
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Одоогоор энэ үнийн саналд бүтээгдэхүүн бүртгэгдээгүй байна.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* TOTAL PRICE */}
        <section className="overflow-hidden rounded-2xl border border-red-100 bg-white shadow-sm">
          <div className="flex flex-col gap-5 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-red-500">
                <FileCheck2 size={19} />

                <span className="text-sm font-semibold">
                  ҮНИЙН САНАЛЫН НЭГТГЭЛ
                </span>
              </div>

              <h2 className="mt-2 text-xl font-bold text-slate-900">
                Нийт даатгалын хураамж
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Сонгогдсон бүх даатгалын бүтээгдэхүүний нийлбэр үнэ
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="rounded-xl bg-red-50 px-5 py-4 sm:min-w-64 sm:text-right">
                <p className="text-xs font-medium text-red-500">НИЙТ ТӨЛБӨР</p>

                <p className="mt-1 text-2xl font-bold text-red-600 sm:text-3xl">
                  {formatMoney(totalFee)}
                </p>
              </div>

              <button
                type="button"
                disabled={priceOfferItems.length === 0}
                onClick={() => setInvoice(true)}
                className="flex items-center justify-center gap-2 rounded-xl bg-green-500 px-5 py-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FileCheck2 size={18} />
                Төлбөрийн нэхэмжлэл үүсгэх
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* INVOICE MODAL (portal-оор body-д гарна) */}
      {invoice && (
        <Invoice
          items={priceOfferItems}
          organizationName={priceOfferOrganization}
          onClose={() => setInvoice(false)}
        />
      )}
    </main>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

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
    <div className="group min-w-0 rounded-2xl border border-slate-200/80 bg-white p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:p-4">
      <div className="hidden items-center justify-between gap-2 sm:flex">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
        >
          <img src={icon} alt={iconAlt} className="h-5 w-5 object-contain" />
        </div>

        <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400 sm:text-xs">
          Үзүүлэлт
        </span>
      </div>

      <p className="mt-2 text-xs font-medium leading-5 text-slate-500 sm:mt-4 sm:text-sm">
        {title}
      </p>

      <div className="mt-1 flex flex-wrap items-baseline gap-1">
        <span
          className={`text-2xl font-bold tracking-tight sm:text-3xl ${accent}`}
        >
          {value}
        </span>

        {suffix && (
          <span className="text-xs font-medium text-slate-400">{suffix}</span>
        )}
      </div>

      <p className="mt-2 text-xs text-slate-400" title={subtitle}>
        {subtitle}
      </p>
    </div>
  );
}

/* =========================================================
   DETAIL CARD
========================================================= */

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

        <h4 className="text-sm font-bold text-slate-800">{title}</h4>
      </div>

      {text ? (
        <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
          {text
            .split("\n")
            .filter(Boolean)
            .map((line, index) => (
              <li key={index} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                <span>{line}</span>
              </li>
            ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-400">Мэдээлэл оруулаагүй байна.</p>
      )}
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

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