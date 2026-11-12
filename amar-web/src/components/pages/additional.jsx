
import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import {
  Search,
  ShieldCheck,
  CheckCircle2,
  Package,
  X,
  Sparkles,
  RefreshCw,
  ChevronDown,
  ArrowUpRight,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const AdditionalService = () => {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Нэмэлт үйлчилгээ татах
  const fetchServices = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/additional-services`
      );

      const result = response.data;

      const items = Array.isArray(result)
        ? result
        : result?.services ?? result?.data ?? [];

      if (!Array.isArray(items)) {
        throw new Error("API өгөгдөл массив хэлбэртэй биш байна.");
      }

      setServices(items);
    } catch (err) {
      console.error("Нэмэлт үйлчилгээ татах алдаа:", err);

      setError(
        err.response?.data?.message ||
        err.message ||
        "Нэмэлт үйлчилгээний мэдээлэл татаж чадсангүй."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Хайлт
  const filteredServices = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return services.filter((service) =>
      String(service.name ?? "")
        .toLowerCase()
        .includes(keyword)
    );
  }, [services, search]);

  // Loading
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-4">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-red-600" />

          <p className="mt-5 text-base font-semibold text-gray-800">
            Нэмэлт үйлчилгээ татаж байна
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Түр хүлээнэ үү...
          </p>
        </div>
      </main>
    );
  }

  // Error
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

          <p className="mt-3 wrap-break-words text-sm leading-6 text-gray-500">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchServices}
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

        {/* Header */}
        <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="h-5 text-red-600" />

              <span className="text-sm text-gray-500">
                Амар даатгал
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Нэмэлт үйлчилгээ
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
              Таны даатгалын хамгаалалтыг илүү өргөн хүрээнд
              бүрдүүлэх нэмэлт үйлчилгээнүүдтэй танилцаарай.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Package size={22} />
            </div>

            <div>
              <p className="text-2xl font-bold leading-7 text-gray-900">
                {String(services.length).padStart(2, "0")}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Нийт үйлчилгээ
              </p>
            </div>
          </div>
        </header>

        {/* Summary */}
        <section className="">
          <SummaryCard
            icon={Package}
            label="Нийт үйлчилгээ"
            value={services.length}
            tag="Үйлчилгээ"
            color="red"
          />
        </section>

        {/* Search */}
        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Нэмэлт үйлчилгээний нэрээр хайх..."
              className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-11 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Хайлтыг цэвэрлэх"
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-200"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
            <p className="text-sm text-gray-500">
              Нийт{" "}
              <span className="font-semibold text-gray-900">
                {filteredServices.length}
              </span>{" "}
              үйлчилгээ
            </p>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="flex items-center gap-1.5 text-sm font-medium text-red-600 transition hover:text-red-700"
              >
                <X size={15} />
                Хайлтыг цэвэрлэх
              </button>
            )}
          </div>
        </section>

        {/* Service list */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Манай нэмэлт үйлчилгээнүүд
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Даатгалын хамгаалалтад ашиглах боломжтой үйлчилгээнүүд
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filteredServices.map((service, index) => {
              const isActive = active === service._id;

              return (
                <article
                  key={service._id || service.id}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-red-100 hover:shadow-lg"
                  style={{
                    animation: `serviceEnter 400ms ease-out ${index * 60}ms both`,
                  }}
                >
                  <div className="p-4 sm:p-5">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 transition group-hover:scale-105 sm:h-14 sm:w-14">
                        <ShieldCheck size={25} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-semibold text-red-700 ring-1 ring-inset ring-red-100">
                            Нэмэлт үйлчилгээ
                          </span>
                        </div>

                        <h3 className={`${isActive ? "line-clamp-none duration-300" : "line-clamp-2 duration-300"} wrap-break-word text-sm font-semibold leading-6 text-gray-900 transition group-hover:text-red-700 sm:text-base`}>
                          {service.name}
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setActive(isActive ? null : service._id)
                        }
                        aria-expanded={isActive}
                        aria-label="Дэлгэрэнгүй харах"
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition ${
                          isActive
                            ? "border-red-100 bg-red-50 text-red-600"
                            : "border-gray-200 bg-white text-gray-400 hover:border-red-200 hover:text-red-600"
                        }`}
                      >
                        <ChevronDown
                          size={19}
                          className={`transition-transform duration-300 ${
                            isActive ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>

                    <div
                      className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-in-out ${
                        isActive
                          ? "mt-4 grid-rows-[1fr] opacity-100"
                          : "mt-0 grid-rows-[0fr] opacity-0"
                      }`}
                    >
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/70 px-4 py-3 sm:px-5">
                    <span className="flex items-center gap-1.5 text-xs text-gray-400">
                      <CheckCircle2
                        size={14}
                        className="text-emerald-600"
                      />
                      AMAR хамгаалалт
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setActive(isActive ? null : service._id)
                      }
                      className="flex items-center gap-1.5 text-xs font-semibold text-red-600 transition hover:gap-2.5 hover:text-red-700"
                    >
                      {isActive ? "Хураах" : "Судлах"}
                      <ArrowUpRight size={15} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Empty state */}
        {filteredServices.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <Search size={28} />
            </div>

            <h3 className="mt-5 text-lg font-bold text-gray-900">
              {search ? "Үйлчилгээ олдсонгүй" : "Үйлчилгээ бүртгэгдээгүй байна"}
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
              {search
                ? "Хайлтын үгээ өөрчлөөд дахин оролдоно уу."
                : "Одоогоор харагдах нэмэлт үйлчилгээ байхгүй байна."}
            </p>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Бүх үйлчилгээ харах
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-8 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50/70 p-4 sm:items-center">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm">
            <Sparkles size={19} />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800">
              Илүү өргөн хамгаалалтыг сонгоорой
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              Нэмэлт үйлчилгээний нөхцөл, хамрах хүрээ болон боломжийн
              талаар дэлгэрэнгүй мэдээллийг манай ажилтнаас аваарай.
            </p>
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes serviceEnter {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
};

const SummaryCard = ({
  icon: Icon,
  label,
  value,
  tag,
  color,
  className = "",
}) => {
  const styles = {
    red: {
      icon: "bg-red-50 text-red-600",
      tag: "bg-red-50 text-red-700",
    },
    green: {
      icon: "bg-green-50 text-green-600",
      tag: "bg-green-50 text-green-700",
    },
    blue: {
      icon: "bg-blue-50 text-blue-600",
      tag: "bg-blue-50 text-blue-700",
    },
  };

  const style = styles[color] || styles.red;

  return (
    <div className={`group rounded-2xl border border-gray-200 bg-white p-3 transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-5 ${className}`}>
      <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${style.icon}`}>
          <Icon size={23} />
        </div>

        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold sm:text-xs ${style.tag}`}>
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

export default AdditionalService;
