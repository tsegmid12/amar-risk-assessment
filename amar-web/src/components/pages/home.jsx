import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import page from "../../assets/page.png";
import flame from "../../assets/flame.png";
import shield from "../../assets/shield.png";
import logo from "../../assets/logo.svg";

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
  ShoppingCart,
  Building2,
  TrendingUp,
  Car,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  LoaderCircle,
  RefreshCw,
  X,
  Printer,
  Sparkles,
  ArrowRight,
  Wallet,
  Percent,
  Gift,
  ChevronDown,
} from "lucide-react";

/* =========================================================
   CONSTANTS & HELPERS
========================================================= */

const RISK_LEVELS = [
  { max: 30, label: "Бага эрсдэл", short: "Бага", color: "#059669", bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-100" },
  { max: 40, label: "Дундаж эрсдэл", short: "Дунд", color: "#EAB308", bg: "bg-yellow-50", text: "text-yellow-700", ring: "ring-yellow-100" },
  { max: 60, label: "Их эрсдэл", short: "Их", color: "#F97316", bg: "bg-orange-50", text: "text-orange-700", ring: "ring-orange-100" },
  { max: Infinity, label: "Өндөр эрсдэл", short: "Маш их", color: "#E11D48", bg: "bg-rose-50", text: "text-rose-700", ring: "ring-rose-100" },
];

const LEGEND = ["0–30 Бага", "31–40 Дунд", "41–60 Их", "61–100 Маш их"];

const categories = ["Бүгд", "Эд хөрөнгө", "Хариуцлага", "Амь нас, эрүүл мэнд", "Тээвэр", "Бусад"];

const cardClass =
  "rounded-3xl border border-slate-200/70 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/60";

const getRiskLevel = (score) =>
  RISK_LEVELS.find((level) => Number(score) <= level.max) || RISK_LEVELS[0];

const formatMoney = (value) =>
  `${(Number(value) || 0).toLocaleString("mn-MN")} ₮`;

// string, массив, эсвэл мөр таслалттай текстийг цэвэр мөрүүдийн жагсаалт болгоно
const toLines = (value) => {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return list
    .flatMap((entry) => String(entry).split("\n"))
    .map((line) => line.trim())
    .filter(Boolean);
};

const getCategories = (category) => {
  if (Array.isArray(category)) return category.filter(Boolean);
  if (typeof category === "string" && category.trim()) return [category];
  return [];
};

const getOrganizationName = (organization) => {
  if (typeof organization === "string") return organization;
  return organization?.name || organization?.organizationName || "Байгууллага";
};

const CategoryIcon = ({ category, className = "" }) => {
  if (category === "Эд хөрөнгө") return <Building2 className={className} />;
  if (category === "Тээвэр") return <Car className={className} />;
  return <ShieldCheck className={className} />;
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
          body > *:not(#invoice-print-root) {
            display: none !important;
          }
          html, body {
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
          }
          .invoice-no-print {
            display: none !important;
          }
          @page {
            size: A4;
            margin: 10mm;
          }
        }
      `}</style>

      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <section
          id="invoice-print"
          className="flex max-h-[96vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        >
          {/* MODAL CONTROLS (PRINT ҮЕД ХАРАГДАХГҮЙ) */}
          <div className="invoice-no-print flex  items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <FileCheck2 size={18} className="text-red-500" />
              <span>Төлбөрийн Нэхэмжлэх Харах</span>
            </div>

            <div>
              <input className="border" placeholder="Регистр" />
              <input className="border" placeholder="Утасны дугаар" />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 shadow-sm"
              >
                <Printer size={16} />
                Хэвлэх
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Хаах"
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* PRINTABLE INVOICE CONTENT */}
          <div className="overflow-y-auto p-6 sm:p-10 font-sans text-slate-800">
            {/* INVOICE HEADER */}
            <div className="flex justify-between items-start border-b-2 border-red-500 pb-6">
              <div>
                <div className="flex items-center gap-1.5 text-red-600 font-black text-2xl tracking-wider">
                  <img src={logo} alt="Logo" className="h-14 w-auto" />
                </div>
                <div className="mt-3 text-xs leading-relaxed text-slate-600">
                  <p><strong className="text-slate-800">Нэр:</strong> АМАР ДААТГАЛ ХХК</p>
                  <p><strong className="text-slate-800">РД:</strong> 2804808</p>
                  <p><strong className="text-slate-800">Хаяг:</strong> СБД, 1-р хороо, Энхтайваны өргөн чөлөө 17, Блю Скай цамхаг, 20-р давхар</p>
                  <p><strong className="text-slate-800">Утас:</strong> 18002111</p>
                </div>
              </div>

              <div className="text-right">
                <h1 className="text-3xl font-semibold">Нэхэмжлэх</h1>
                <p className="mt-1 text-sm font-bold">№ 291</p>
                <p className="mt-1 text-sm text-slate-500">Нэхэмжилсэн огноо {new Date().toLocaleDateString()}</p>
                <div className="mt-3 text-xs leading-relaxed text-slate-600">
                  <p><strong className="text-slate-800">То Нэр:</strong> {organizationName}</p>
                  <p><strong className="text-slate-800">РД:</strong> 5812968</p>
                  <p><strong className="text-slate-800">Утасны дугаар:</strong> +976 9903 8010</p>
                  <p><strong className="text-slate-800">Төлбөр төлөх хугацаа:</strong>{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* BANK DETAILS */}
            <div className="my-6 rounded-xl bg-slate-50 p-4 border border-slate-200/80 text-xs grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-500">Банкны нэр:</p>
                <p className="font-bold text-slate-800 text-sm">Хаан банк</p>
              </div>
              <div>
                <p className="text-slate-500">Банкны дансны дугаар (MNT):</p>
                <p className="font-mono font-bold text-slate-900 text-sm tracking-wide">MN570005005070895140</p>
              </div>
            </div>

            {/* ITEMS TABLE */}
            <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full border-collapse text-xs text-left">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-3">Гүйлгээний утга</th>
                    <th className="p-3 text-center">Тоо хэмжээ</th>
                    <th className="p-3 text-right">Төрөл (Нэгж үнэ)</th>
                    <th className="p-3 text-right">Нийт үнэ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.length > 0 ? (
                    items.map((item, index) => (
                      <tr key={item._id || index} className="hover:bg-slate-50/50">
                        <td className="p-3 font-medium text-slate-800">
                          {item.insuranceId?.name || "ГЭНЭТИЙН ОСЛЫН ДААТГАЛ (88C2600962)"}
                        </td>
                        <td className="p-3 text-center">{item.quantity || 1}</td>
                        <td className="p-3 text-right text-slate-600">
                          {formatMoney(item.valuation || 100000)}
                        </td>
                        <td className="p-3 text-right font-bold text-slate-900">
                          {formatMoney(item.feeAmount || 400000)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-3 font-medium text-slate-800">ГЭНЭТИЙН ОСЛЫН ДААТГАЛ (88C2600962)</td>
                      <td className="p-3 text-center">4</td>
                      <td className="p-3 text-right text-slate-600">100,000 ₮</td>
                      <td className="p-3 text-right font-bold text-slate-900">400,000 ₮</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* TOTAL SECTION */}
            <div className="mt-4 flex justify-end">
              <div className="w-full max-w-xs space-y-2 border-t-2 border-slate-800 pt-3 text-sm">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Дүн:</span>
                  <span>{formatMoney(totalAmount || 400000)}</span>
                </div>
                <div className="flex justify-between font-black text-base text-red-600 border-t border-slate-200 pt-2">
                  <span>Нийт:</span>
                  <span>{formatMoney(totalAmount || 400000)}</span>
                </div>
              </div>
            </div>

            {/* FOOTER / SIGNATURE */}
            <div className="mt-16 flex justify-between items-end border-t border-dashed border-slate-300 pt-6 text-xs text-slate-600">
              <div>
                <p className="font-bold text-slate-800">АМАР ДААТГАЛ ХХК</p>
                <p className="mt-1 text-slate-400">Системээс автомат үүсгэсэн баримт.</p>
              </div>
              <div className="text-right">
                <p><span className="font-semibold text-slate-700">Санхүү нягтлан бодогч:</span> Ц.Сэлэнгэ</p>
                <div className="mt-2 h-10 border-b border-slate-400 w-48 ml-auto flex items-end justify-center text-[10px] text-slate-400 italic">
                  (Тамга / Тэмдэг)
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>,
    document.body
  );
}

/* =========================================================
   SMALL SHARED COMPONENTS
========================================================= */

function Breadcrumb({ label }) {
  return (
    <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
      <ShieldCheck size={17} className="text-red-500" />
      <span className="font-semibold text-slate-700">AMAR</span>
      <span className="text-slate-300">/</span>
      <span>{label}</span>
    </div>
  );
}

// Нээгдэх үед зүүн/баруун талаас гулсаж орж ирдэг карт, доторх мөрүүд нэг нэгээрээ гарна
function InfoList({ title, items, icon: Icon, tone, open = true, from = "left" }) {
  const tones = {
    red: { box: "bg-red-50/60 ring-red-100", icon: "bg-red-500 text-white", dot: "text-red-500" },
    green: { box: "bg-emerald-50/60 ring-emerald-100", icon: "bg-emerald-500 text-white", dot: "text-emerald-500" },
  };
  const t = tones[tone] || tones.red;

  const hiddenShift = from === "left" ? "-translate-x-8" : "translate-x-8";
  const baseDelay = from === "left" ? 120 : 240;

  return (
    <div
      style={{ transitionDelay: open ? `${baseDelay}ms` : "0ms" }}
      className={`rounded-2xl p-4 ring-1 ring-inset transition-all duration-500 ease-out ${t.box} ${
        open ? "translate-x-0 opacity-100" : `${hiddenShift} opacity-0`
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${t.icon}`}>
          <Icon size={16} />
        </span>
        <h4 className="text-sm font-bold text-slate-800">{title}</h4>
      </div>

      {items.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {items.map((line, index) => (
            <li
              key={index}
              style={{
                transitionDelay: open ? `${baseDelay + 150 + index * 70}ms` : "0ms",
              }}
              className={`flex gap-2 text-sm leading-6 text-slate-600 transition-all duration-500 ease-out ${
                open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
              }`}
            >
              <CheckCircle2 size={16} className={`mt-1 shrink-0 ${t.dot}`} />
              <span className="wrap-break-word">{line}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-400">Мэдээлэл оруулаагүй байна.</p>
      )}
    </div>
  );
}
// Товч дарахад "Хамрах хүрээ" ба "Нэмэлт үйлчилгээ" нь animation-тай нээгдэж/хураагдана
function ExpandableDetails({ coverage, open, onToggle, className = "" }) {

  const coverageLines = toLines(coverage);

  return (
    <div className={className}>
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className={`group flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all duration-300 ${
          open
            ? "border-red-200 bg-red-50 text-red-600"
            : "border-slate-200 bg-white text-slate-700 hover:border-red-200 hover:bg-red-50/60 hover:text-red-600"
        }`}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <ShieldCheck size={18} className="shrink-0" />
          <span className="text-sm font-semibold">
            {open ? "Хураах" : "Хамрах хүрээ, нэмэлт үйлчилгээ харах"}
          </span>
        </span>

        <span className="flex shrink-0 items-center gap-2">
          <span className="hidden rounded-md bg-white/80 px-2 py-0.5 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200 sm:inline">
            {coverageLines.length} зүйл
          </span>
          <ChevronDown
            size={18}
            className={`transition-transform duration-500 ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      <div
        aria-hidden={!open}
        className={`grid transition-all duration-500 ease-in-out ${
          open ? "mt-3 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="">
            <InfoList
              title="Хамрах хүрээ"
              items={coverageLines}
              icon={ShieldCheck}
              tone="red"
              open={open}
              from="left"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message = "Мэдээлэл олдсонгүй." }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-5 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
        <ShieldCheck size={25} />
      </div>
      <p className="mt-3 text-sm text-slate-500">{message}</p>
    </div>
  );
}

function HeroStat({ icon, alt, iconBg, title, value, suffix = "", subtitle }) {
  return (
    <div className="min-w-0 rounded-2xl bg-white/10 p-3.5 ring-1 ring-white/15 backdrop-blur-sm sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${iconBg}`}
        >
          <img src={icon} alt={alt} className="h-5 w-5 object-contain" />
        </span>
      </div>

      <p className="mt-3 text-xs font-medium text-slate-300 sm:text-sm">{title}</p>

      <div className="mt-1 flex flex-wrap items-baseline gap-1">
        <span className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {value}
        </span>
        {suffix && <span className="text-xs text-slate-400">{suffix}</span>}
      </div>

      <p className="mt-1 truncate text-xs text-slate-400" title={subtitle}>
        {subtitle}
      </p>
    </div>
  );
}

/* =========================================================
   HOME
========================================================= */

export default function Home() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [riskAssessment, setRiskAssessment] = useState(null);
  const [priceOffer, setPriceOffer] = useState(null);

  const [pageType, setPageType] = useState(null);
  const [active, setActive] = useState("Бүгд");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [invoice, setInvoice] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

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

  // Оноогоор нь эрэмбэлсэн жагсаалт (өндөр эрсдэл эхэнд)
  const rankedRisks = useMemo(
    () => [...data].sort((a, b) => b.value - a.value),
    [data]
  );

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
    const list = getCategories(item.category);
    return active === "Бүгд" || list.includes(active);
  });

  const categoryCount = (category) =>
    category === "Бүгд"
      ? selectedInsurance.length
      : selectedInsurance.filter((item) =>
          getCategories(item.category).includes(category)
        ).length;

  const organizationName =
    riskAssessment?.organizationName ||
    getOrganizationName(riskAssessment?.organization);

  const highRiskCount = data.filter((item) => item.value >= 61).length;
  const averageLevel = getRiskLevel(averageValue);

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
          <LoaderCircle size={38} className="mx-auto animate-spin text-red-500" />
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

    <main className="min-h-screen overflow-x-clip bg-[#F6F7FB] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7 sm:space-y-9">
        {/* HERO */}
        <section>
          <Breadcrumb label="Даатгалын санал" />

          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-red-300 via-red-500 to-rose-900 p-6 text-white shadow-xl shadow-slate-900/10 sm:p-10">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-red-500/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-rose-400/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 lg:max-w-xl">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-red-100 ring-1 ring-white/15">
                  <Sparkles size={14} />
                  Эрсдэлийн үнэлгээнд суурилсан санал
                </span>

                <h1 className="mt-4 wrap-break-word text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  {organizationName}
                </h1>

                <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
                  Танай байгууллагын эрсдэлийг үнэлж, хамгаалах даатгалын
                  зөвлөмжийг доор нэг дор хүргэж байна.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 lg:w-136">
                <HeroStat
                  icon={page}
                  alt="Санал"
                  iconBg="bg-emerald-500"
                  title="Санал болгосон"
                  value={selectedInsurance.length}
                  subtitle="Даатгалын санал"
                />
                <HeroStat
                  icon={flame}
                  alt="Эрсдэл"
                  iconBg="bg-red-500"
                  title="Хамгийн өндөр"
                  value={maxValue.value}
                  suffix="/100"
                  subtitle={maxValue.name}
                />
                <HeroStat
                  icon={shield}
                  alt="Дундаж"
                  iconBg="bg-yellow-500"
                  title="Дундаж эрсдэл"
                  value={averageValue}
                  suffix="/100"
                  subtitle={averageLevel.label}
                />
              </div>
            </div>
          </div>
        </section>

        {/* RISK OVERVIEW */}
        <section className="grid grid-cols-1 gap-5 xl:grid-cols-5">
          {/* CHART */}
          <div className={`${cardClass} min-w-0 p-5 sm:p-7 xl:col-span-3`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  Эрсдэлийн үнэлгээ
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Төрөл тус бүрийн эрсдэлийн онооны харьцуулалт
                </p>
              </div>

              <div className="shrink-0 rounded-xl bg-red-50 p-2.5">
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
                      radius={[8, 8, 0, 0]}
                      maxBarSize={44}
                      animationDuration={800}
                    >
                      {data.map((item) => (
                        <Cell
                          key={item.id}
                          fill={getRiskLevel(item.value).color}
                          className="transition-opacity hover:opacity-80"
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
                <div key={level.label} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: level.color }}
                  />
                  <span className="text-xs text-slate-500">{LEGEND[index]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RANKED RISKS */}
          <div className={`${cardClass} p-5 sm:p-7 xl:col-span-2`}>
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Эрсдэлийн эрэмбэ
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {data.length} төрлийн эрсдэл
              {highRiskCount > 0
                ? `, үүнээс ${highRiskCount} нь өндөр эрсдэлтэй`
                : ", өндөр эрсдэл илрээгүй"}
            </p>

            {rankedRisks.length > 0 ? (
              <ul className="mt-5 space-y-4">
                {rankedRisks.map((item) => {
                  const level = getRiskLevel(item.value);

                  return (
                    <li key={item.id}>
                      <div className="mb-1.5 flex items-center justify-between gap-3">
                        <span className="truncate text-sm font-semibold text-slate-700">
                          {item.name}
                        </span>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset ${level.bg} ${level.text} ${level.ring}`}
                        >
                          {item.value} · {level.short}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${item.value}%`,
                            backgroundColor: level.color,
                          }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState message="Эрсдэлийн мэдээлэл алга." />
            )}
          </div>
        </section>

        {/* INSURANCE SECTION */}
        <section className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-500">
                <ShieldCheck size={17} />
                <span>Танд зориулсан</span>
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Эрсдэлийг хамгаалах даатгалууд
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
                Даатгал бүрийн хамрах хүрээ, нэмэлт үйлчилгээг харахын тулд
                картын товчийг дарна уу.
              </p>
            </div>

            <span className="w-fit rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600">
              {filteredData.length} даатгал
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
                  onClick={() => setActive(category)}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    selected
                      ? "bg-red-500 text-white shadow-md shadow-red-500/20"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  }`}
                >
                  {category}
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[11px] ${
                      selected ? "bg-white/20" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {categoryCount(category)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* INSURANCE LIST — бүх мэдээлэл шууд харагдана */}
          <div className="grid grid-cols-2 gap-5 space-y-5">
            {filteredData.map((item, index) => {
              const itemId = item._id || item.id || index;
              const itemCategories = getCategories(item.category);

              return (
                <article
                  key={itemId}
                  className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/60"
                >
                  <div className="h-1.5 bg-linear-to-r from-red-500 via-rose-400 to-orange-300" />

                  <div className="p-5 sm:p-7">
                    {/* HEADER */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500 text-white shadow-md shadow-red-500/25 sm:h-14 sm:w-14">
                        <CategoryIcon
                          category={itemCategories[0]}
                          className="h-6 w-6 sm:h-7 sm:w-7"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="wrap-break-word text-lg font-bold text-slate-900 sm:text-xl">
                            {item.name || "Даатгалын нэр"}
                          </h3>

                          {(itemCategories.length ? itemCategories : ["Бусад"]).map(
                            (category) => (
                              <span
                                key={category}
                                className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600"
                              >
                                {category}
                              </span>
                            )
                          )}
                        </div>

                        <p className={`mt-2 whitespace-pre-line text-sm leading-6 text-slate-500 sm:text-[15px] line-clamp-2`}>
                          {item.description || "Тайлбар оруулаагүй байна."}
                        </p>
                      </div>
                    </div>

                    {/* DETAILS (animation-тай нээгдэнэ) */}
                     <ExpandableDetails
                        coverage={item.coverage}
                        additionalServices={item.additionalServices}
                        open={expandedId === item._id}
                        onToggle={() =>
                          setExpandedId((prev) =>
                            prev === item._id ? null : item._id
                          )
                        }
                      />
                  </div>
                </article>
              );
            })}

            {filteredData.length === 0 && (
              <EmptyState message="Энэ ангилалд тохирох даатгал одоогоор байхгүй байна." />
            )}
          </div>

          {/* CTA */}
          {selectedInsurance.length > 0 && (
            <div className="flex flex-col gap-4 rounded-3xl bg-linear-to-r from-emerald-600 to-emerald-500 p-6 text-white shadow-lg shadow-emerald-500/20 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-white/20 p-2.5">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <p className="text-lg font-bold">Танд санал болгож байна</p>
                  <p className="mt-1 text-sm leading-5 text-emerald-50">
                    Эрсдэлийн үнэлгээнд үндэслэн сонгогдсон даатгалууд. Нэмэлт
                    үйлчилгээний талаар дэлгэрэнгүй мэдээлэл аваарай.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate(`/${id}/additional`)}
                className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 sm:w-auto"
              >
                Нэмэлт үйлчилгээ
                <ArrowRight size={17} />
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  ) : (
    /* =======================================================
       PRICE OFFER PAGE
    ======================================================= */

    <main className="min-h-screen overflow-x-clip bg-[#F6F7FB] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* HERO */}
        <section>
          <Breadcrumb label="Даатгалын үнийн санал" />

          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-red-300 via-red-500 to-rose-900 p-6 text-white shadow-xl shadow-red-500/20 sm:p-10">
            <div className="pointer-events-none absolute -right-12 -top-12 h-60 w-60 rounded-full bg-white/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 left-1/4 h-52 w-52 rounded-full bg-orange-300/20 blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/25">
                  <CheckCircle2 size={14} />
                  Даатгалын бүтээгдэхүүний үнийн санал 
                </span>

                <p className="mt-4 text-sm font-medium text-red-100">
                  Үнийн санал хүлээн авагч байгууллага
                </p>

                <h1 className="mt-1 wrap-break-word text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  {priceOfferOrganization}
                </h1>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:w-120">
                <div className="rounded-2xl bg-white/15 p-4 ring-1 ring-white/20 backdrop-blur-sm">
                  <p className="text-xs font-medium text-red-100">
                    Нийт бүтээгдэхүүн
                  </p>
                  <p className="mt-2 text-3xl font-bold">
                    {priceOfferItems.length}
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-4 text-red-600">
                  <p className="text-xs font-medium text-red-400">
                    Нийт хураамж
                  </p>
                  <p className="mt-2 text-2xl font-bold sm:text-3xl">
                    {formatMoney(totalFee)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INSURANCE LIST */}
        <section className="space-y-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Санал болгож буй даатгалууд
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Бүтээгдэхүүн бүрийн хамрах хүрээ, нэмэлт үйлчилгээг товчийг дарж харна уу.
              </p>
            </div>

            <span className="w-fit rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 ring-1 ring-slate-200">
              {priceOfferItems.length} бүтээгдэхүүн
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {priceOfferItems.map((item, index) => {
              const itemId = item._id || index;
              const insurance = item.insuranceId || {};
              const itemCategories = getCategories(insurance.category);

              return (
                <article
                  key={itemId}
                  className="flex flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-0.5 hover:border-red-200 hover:shadow-xl hover:shadow-red-500/5"
                >
                  <div className="h-1.5 bg-linear-to-r from-red-500 via-rose-400 to-orange-300" />

                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    {/* HEADER */}
                    <div className="flex items-start gap-3.5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500 text-white shadow-md shadow-red-500/25">
                        <CategoryIcon
                          category={itemCategories[0]}
                          className="h-6 w-6"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold tracking-wide text-red-500">
                          ДААТГАЛ #{index + 1}
                        </span>

                        <h3 className="mt-0.5 wrap-break-word text-lg font-bold text-slate-900 sm:text-xl">
                          {insurance.name || "Даатгалын нэр"}
                        </h3>

                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {(itemCategories.length ? itemCategories : ["Даатгал"]).map(
                            (category) => (
                              <span
                                key={category}
                                className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600"
                              >
                                {category}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    {insurance.description && (
                      <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-500 ">
                        {insurance.description}
                      </p>
                    )}

                    {/* DETAILS (animation-тай нээгдэнэ) */}
                    <ExpandableDetails
                      className="mt-5"
                      coverage={insurance.coverage}
                      additionalServices={insurance.additionalServices}
                      open={expandedId === item._id}
                      onToggle={() =>setExpandedId((prev) => (prev === item._id ? null : item._id))}
                    />

                    {/* PRICE */}
                    <div className="mt-auto pt-5">
                      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-slate-200 overflow-hidden rounded-2xl bg-slate-50 ring-1 ring-slate-100">
                        <div className="p-3.5 sm:p-4">
                          <p className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 sm:text-xs">
                            <Wallet size={13} />
                            Үнэлгээ
                          </p>
                          <p className="mt-2 text-sm font-bold text-emerald-600 sm:text-lg">
                            {formatMoney(item.valuation)}
                          </p>
                        </div>

                        <div className="p-3.5 sm:p-4">
                          <p className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 sm:text-xs">
                            <ShoppingCart size={13} />
                            Тоо хэмжээ
                          </p>
                          <p className="mt-2 text-sm font-bold text-emerald-600 sm:text-lg">
                            {item.quantity || 1}
                          </p>
                        </div>

                        <div className="p-3.5 sm:p-4">
                          <p className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 sm:text-xs">
                            <Percent size={13} />
                            Хувь
                          </p>
                          <p className="mt-2 text-sm font-bold text-slate-800 sm:text-lg">
                            {(Number(item.feePercentage) || 0).toLocaleString(
                              "mn-MN"
                            )}
                            %
                          </p>
                        </div>

                        <div className="bg-red-50 p-3.5 sm:p-4">
                          <p className="text-[11px] font-medium text-red-500 sm:text-xs">
                            Хураамж
                          </p>
                          <p className="mt-2 text-sm font-bold text-red-600 sm:text-lg">
                            {formatMoney(item.feeAmount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}

            {priceOfferItems.length === 0 && (
              <div className="col-span-full">
                <EmptyState message="Одоогоор энэ үнийн саналд бүтээгдэхүүн бүртгэгдээгүй байна." />
              </div>
            )}
          </div>
        </section>

        {/* TOTAL PRICE (дэлгэцийн доор наалдаж харагдана) */}
        <section className="sticky bottom-3 z-30 overflow-hidden rounded-3xl border border-red-100 bg-white/95 shadow-2xl shadow-slate-900/10 backdrop-blur sm:bottom-5">
          <div className="flex flex-col gap-4 p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                <FileCheck2 size={24} />
              </div>

              <div>
                <p className="text-xs font-bold tracking-wide text-red-500">
                  ҮНИЙН САНАЛЫН НЭГТГЭЛ
                </p>
                <h2 className="text-lg font-bold text-slate-900">
                  Нийт даатгалын хураамж
                </h2>
                <p className="text-xs text-slate-500">
                  {priceOfferItems.length} бүтээгдэхүүний нийлбэр үнэ
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="rounded-2xl bg-red-50 px-5 py-3 sm:min-w-56 sm:text-right">
                <p className="text-[11px] font-semibold text-red-500">
                  НИЙТ ТӨЛБӨР
                </p>
                <p className="text-2xl font-bold text-red-600 sm:text-3xl">
                  {formatMoney(totalFee)}
                </p>
              </div>

              <button
                type="button"
                disabled={priceOfferItems.length === 0}
                onClick={() => setInvoice(true)}
                className="flex items-center justify-center gap-2 rounded-xl bg-green-500 px-5 py-4 text-sm font-semibold text-white shadow-md shadow-green-500/25 transition-all duration-300 hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
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