
import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import {
  Search, ShieldCheck, Building2, Flame, Activity, Car,
  Layers, ChevronDown, CheckCircle2, FileText, HeartPulse,
  Package, X, SlidersHorizontal, ArrowUpRight, Sparkles,
  RefreshCw, Box
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const toLines = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) =>
        typeof item === "string"
          ? item
          : item?.name || item?.title || ""
      )
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const getInsuranceIcon = (name = "", category = "") => {
  const value = `${name} ${category}`.toLowerCase();

  if (value.includes("гал")) return Flame;
  if (value.includes("тээвэр") || value.includes("машин")) return Car;
  if (value.includes("осол")) return Activity;
  if (value.includes("эрүүл мэнд") || value.includes("амь нас")) return HeartPulse;
  if (value.includes("хариуцлага")) return ShieldCheck;
  if (value.includes("хөрөнгө") || value.includes("газар")) return Building2;

  return Layers;
};

const getInsuranceColor = (category = "") => {
  switch (category) {
    case "Эд хөрөнгө": return "red";
    case "Хариуцлага": return "purple";
    case "Амь нас, эрүүл мэнд": return "blue";
    case "Ачаа тээвэр": return "emerald";
    default: return "orange";
  }
};

const normalizeInsurance = (item) => ({
  ...item,
  id: item._id || item.id,
  name: item.name || item.title || "Нэргүй даатгал",
  category: item.category || "Бусад",
  description: item.description || "Тайлбар оруулаагүй байна.",
  risk: toLines(item.risk),
  coverage: toLines(item.coverage || item.coverageDescription),
  additionalServices: toLines(item.additionalServices),
  icon: getInsuranceIcon(item.name || item.title, item.category),
  color: getInsuranceColor(item.category),
});

const categories = [
  { name: "Бүгд", icon: Layers },
  { name: "Эд хөрөнгө", icon: Building2 },
  { name: "Хариуцлага", icon: ShieldCheck },
  { name: "Амь нас, эрүүл мэнд", icon: HeartPulse },
  { name: "Ачаа тээвэр", icon: Box },
  { name: "Бусад", icon: Package },
];

const colorStyles = {
  red: {
    icon: "bg-red-50 text-red-600",
    badge: "bg-red-50 text-red-700 ring-red-100",
  },
  orange: {
    icon: "bg-orange-50 text-orange-600",
    badge: "bg-orange-50 text-orange-700 ring-orange-100",
  },
  purple: {
    icon: "bg-violet-50 text-violet-600",
    badge: "bg-violet-50 text-violet-700 ring-violet-100",
  },
  blue: {
    icon: "bg-blue-50 text-blue-600",
    badge: "bg-blue-50 text-blue-700 ring-blue-100",
  },
  emerald: {
    icon: "bg-emerald-50 text-emerald-600",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  },
};

const Insurances = () => {
  const [active, setActive] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Бүгд");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [initialInsurances, setInitialInsurances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchInsurances = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${API_URL}/insurance-products`);
      const result = response.data;

      const items = Array.isArray(result)
        ? result
        : result?.products ?? result?.insurances ?? result?.data ?? [];

      if (!Array.isArray(items)) {
        throw new Error("API өгөгдөл массив хэлбэртэй биш байна.");
      }

      setInitialInsurances(items.map(normalizeInsurance));
    } catch (err) {
      console.error("Даатгал татах алдаа:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Даатгалын мэдээлэл татаж чадсангүй."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsurances();
  }, []);

  const data = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return initialInsurances.filter((insurance) => {
      const searchable = [
        insurance.name,
        insurance.description,
        insurance.category,
        ...insurance.risk,
        ...insurance.coverage,
        ...insurance.additionalServices,
      ].join(" ").toLowerCase();

      const matchesSearch = searchable.includes(search);
      const matchesCategory =
        selectedCategory === "Бүгд" ||
        insurance.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [initialInsurances, searchTerm, selectedCategory]);

  const propertyCount = initialInsurances.filter(
    (item) => item.category === "Эд хөрөнгө"
  ).length;

  const categoryCount = new Set(
    initialInsurances.map((item) => item.category)
  ).size;

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("Бүгд");
    setActive(null);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-4">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-red-600" />
          <p className="mt-5 font-semibold text-gray-800">
            Даатгалын мэдээлэл татаж байна
          </p>
          <p className="mt-2 text-sm text-gray-500">Түр хүлээнэ үү...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <ShieldCheck size={30} />
          </div>
          <h2 className="mt-5 text-xl font-bold text-gray-900">
            Мэдээлэл татахад алдаа гарлаа
          </h2>
          <p className="mt-3 wrap-break-word text-sm leading-6 text-gray-500">
            {error}
          </p>
          <button
            type="button"
            onClick={fetchInsurances}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            <RefreshCw size={16} />
            Дахин оролдох
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa]">
      <div className="mx-auto w-full min-w-0 space-y-7 p-4 sm:p-6 md:px-8 lg:p-10 lg:pl-85 lg:pr-85">
        <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="h-5 text-red-600" />
              <span className="text-sm text-gray-500">Амар даатгал</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Даатгалын саналууд
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
              Байгууллагын эрсдэлд тохирсон даатгалын хамгаалалтуудыг нэг дороос судлаарай.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <ShieldCheck size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold leading-7 text-gray-900">
                {String(initialInsurances.length).padStart(2, "0")}
              </p>
              <p className="mt-1 text-xs text-gray-500">Даатгалын төрөл</p>
            </div>
          </div>
        </header>

        <section className="mb-8 grid grid-cols-3 gap-3 sm:gap-5">
          <SummaryCard
            icon={Building2}
            label="Эд хөрөнгийн даатгал"
            value={propertyCount}
            tag="Хамгаалалт"
            color="red"
          />
          <SummaryCard
            icon={ShieldCheck}
            label="Нийт даатгал"
            value={initialInsurances.length}
            tag="Даатгал"
            color="green"
          />
          <SummaryCard
            icon={Layers}
            label="Ангилал"
            value={categoryCount}
            tag="Сонголт"
            color="blue"
          />
        </section>

        <section className="relative z-30 mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Даатгалын нэр, тайлбар, эрсдэлээр хайх..."
                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-11 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label="Хайлтыг цэвэрлэх"
                  className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-200 hover:text-gray-700"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="relative lg:w-64">
              <button
                type="button"
                onClick={() => setIsFilterOpen((prev) => !prev)}
                aria-expanded={isFilterOpen}
                className={`flex h-12 w-full items-center justify-between gap-3 rounded-xl border bg-white px-4 text-sm transition ${
                  isFilterOpen
                    ? "border-red-300 ring-4 ring-red-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <SlidersHorizontal size={17} className="shrink-0 text-red-600" />
                  <span className="truncate font-medium text-gray-700">
                    {selectedCategory}
                  </span>
                </span>
                <ChevronDown
                  size={17}
                  className={`shrink-0 text-gray-400 transition-transform ${
                    isFilterOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isFilterOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Цэсийг хаах"
                    className="fixed inset-0 z-20 cursor-default"
                    onClick={() => setIsFilterOpen(false)}
                  />
                  <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-full overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl">
                    {categories.map((category) => {
                      const CategoryIcon = category.icon;
                      const selected = selectedCategory === category.name;

                      return (
                        <button
                          key={category.name}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(category.name);
                            setIsFilterOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                            selected
                              ? "bg-red-50 font-semibold text-red-700"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            <CategoryIcon size={17} />
                            {category.name}
                          </span>
                          {selected && <CheckCircle2 size={16} />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-500">
              Нийт <span className="font-semibold text-gray-900">{data.length}</span> даатгалын санал
            </p>
            {(searchTerm || selectedCategory !== "Бүгд") && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700"
              >
                <X size={15} />
                Шүүлт цэвэрлэх
              </button>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 items-start gap-5 xl:grid-cols-2">
          {data.map((insurance, index) => {
            const Icon = insurance.icon;
            const style = colorStyles[insurance.color] || colorStyles.red;
            const isActive = active === insurance.id;

            return (
              <article
                key={insurance.id}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-red-100 hover:shadow-xl"
                style={{
                  animation: `insuranceEnter 450ms ease-out ${index * 70}ms both`,
                }}
              >
                <div className="p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition group-hover:scale-105 ${style.icon}`}>
                      <Icon size={26} strokeWidth={1.8} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${style.badge}`}>
                          {insurance.category}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <ShieldCheck size={13} />
                          AMAR хамгаалалт
                        </span>
                      </div>
                      <h2 className="text-base font-bold leading-6 text-gray-900 transition group-hover:text-red-700 sm:text-lg">
                        {insurance.name}
                      </h2>
                      <p className={`mt-2 cursor-pointer text-sm leading-6 text-gray-500 ${isActive ? "whitespace-pre-wrap" : "line-clamp-2"}`}>
                        {insurance.description}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    aria-expanded={isActive}
                    onClick={() => setActive(isActive ? null : insurance.id)}
                    className={`mt-5 flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                      isActive
                        ? "border-red-100 bg-red-50 text-red-700"
                        : "border-gray-200 bg-white text-gray-700 hover:border-red-200 hover:bg-red-50/50 hover:text-red-700"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <FileText size={17} />
                      {isActive ? "Хураах" : "Дэлгэрэнгүй мэдээлэл"}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-300 ${isActive ? "rotate-180" : ""}`}
                    />
                  </button>

                  <div className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-in-out ${
                    isActive ? "mt-4 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0"
                  }`}>
                    <div className="overflow-hidden">
                      <div className={`rounded-xl border border-gray-100 bg-gray-50/80 p-4 transition duration-300 ${
                        isActive ? "translate-x-0" : "-translate-x-4"
                      }`}>
                        <div className="space-y-4">
                          <DetailList
                            icon={ShieldCheck}
                            title="Хамрах хүрээ"
                            items={insurance.coverage}
                            emptyText="Хамрах хүрээний мэдээлэл байхгүй байна."
                            iconClass="bg-white text-red-600"
                          />

                          {insurance.risk.length > 0 && (
                            <>
                              <div className="h-px bg-gray-200" />
                              <DetailList
                                icon={Activity}
                                title="Даатгалын эрсдэл"
                                items={insurance.risk}
                                emptyText="Эрсдэлийн мэдээлэл байхгүй байна."
                                iconClass="bg-white text-orange-600"
                              />
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/70 px-5 py-3.5 sm:px-6">
                  <span className="flex items-center gap-1.5 text-xs text-gray-400">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    Даатгалын санал
                  </span>
                  <button
                    type="button"
                    onClick={() => setActive(isActive ? null : insurance.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-red-600 transition hover:gap-2.5 hover:text-red-700"
                  >
                    {isActive ? "Хураах" : "Судлах"}
                    <ArrowUpRight size={15} />
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        {data.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <Search size={28} />
            </div>
            <h3 className="mt-5 text-lg font-bold text-gray-900">Даатгал олдсонгүй</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
              Хайлтын үг эсвэл сонгосон ангиллаа өөрчлөөд дахин оролдоно уу.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Бүх даатгал харах
            </button>
          </div>
        )}

        <footer className="mt-8 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50/70 p-4 sm:items-center">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm">
            <Sparkles size={19} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">
              Танд тохирсон хамгаалалтыг сонгоорой
            </p>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              Даатгалын сонголтоо хийхдээ байгууллагын эрсдэлийн үнэлгээ,
              хамрах хүрээ болон гэрээний нөхцөлийг харгалзан үзээрэй.
            </p>
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes insuranceEnter {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
};

const SummaryCard = ({ icon: Icon, label, value, tag, color }) => {
  const styles = {
    red: "text-red-600 sm:bg-red-50 bg-red-50",
    green: "text-green-600 sm:bg-green-50 bg-green-50",
    blue: "text-blue-600 sm:bg-blue-50 bg-blue-50",
  };

  const tags = {
    red: "bg-red-50 text-red-700",
    green: "bg-green-50 text-green-700",
    blue: "bg-blue-50 text-blue-700",
  };

  return (
    <div className="group rounded-2xl border border-gray-200 bg-white p-3 transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-5">
      <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${styles[color]}`}>
          <Icon size={23} />
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold sm:text-xs ${tags[color]}`}>
          {tag}
        </span>
      </div>
      <p className="mt-4 text-xl font-bold text-gray-900 sm:mt-5 sm:text-2xl">
        {value}
      </p>
      <p className="mt-1 text-[11px] leading-4 text-gray-500 sm:text-sm">
        {label}
      </p>
    </div>
  );
};

const DetailList = ({
  icon: Icon,
  title,
  items = [],
  emptyText,
  iconClass,
  itemIcon: ItemIcon = ShieldCheck,
  itemClass = "text-red-600",
}) => (
  <div className="flex items-start gap-3">
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-sm ${iconClass}`}>
      <Icon size={17} />
    </div>
    <div className="min-w-0 flex-1">
      <h3 className="mb-2 text-sm font-semibold text-gray-800">{title}</h3>
      <div className="space-y-2">
        {items.length > 0 ? (
          items.map((item, index) => (
            <div key={`${item}-${index}`} className="flex items-start gap-2 text-sm text-gray-600">
              <ItemIcon size={15} className={`mt-0.5 shrink-0 ${itemClass}`} />
              <span>{item}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400">{emptyText}</p>
        )}
      </div>
    </div>
  </div>
);

export default Insurances;