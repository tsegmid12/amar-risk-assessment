
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Building2,
  Car,
  Zap,
  Droplet,
  ShieldCheck,
  CheckCircle2,
  Package,
  ChevronDown,
} from "lucide-react";

const Additional = () => {
  const [addService, setAddService] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedService, setExpandedService] = useState(null);

  // Даатгалын бүтээгдэхүүнүүдийг API-аас авах
  useEffect(() => {
    const fetchAddService = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          "http://localhost:3000/insurance-products"
        );

        const products = Array.isArray(response.data)
          ? response.data
          : response.data?.insuranceProducts ||
            response.data?.products ||
            [];

        setAddService(products);
      } catch (err) {
        console.error(
          "Error fetching insurance products:",
          err.response?.data || err.message
        );

        setError("Нэмэлт үйлчилгээ ачааллахад алдаа гарлаа.");
      } finally {
        setLoading(false);
      }
    };

    fetchAddService();
  }, []);

  // Ангилал бүрд тохирох icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case "Эд хөрөнгө":
        return <Building2 size={25} />;

      case "Тээвэр":
        return <Car size={25} />;

      case "Цахилгаан":
        return <Zap size={25} />;

      case "Эрүүл мэнд":
        return <Droplet size={25} />;

      default:
        return <Package size={25} />;
    }
  };

  // Нэмэлт үйлчилгээг нээх / хаах
  const toggleService = (serviceId) => {
    setExpandedService((current) =>
      current === serviceId ? null : serviceId
    );
  };

  return (
    <main className="min-h-screen bg-gray-50/70 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <header className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-red-600">
            <ShieldCheck size={24} />

            <span className="text-sm font-bold tracking-wide">
              AMAR ДААТГАЛ
            </span>
          </div>

          <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Нэмэлт үйлчилгээ
          </h1>

          <p className="max-w-2xl text-sm leading-7 text-gray-500 sm:text-base">
            Даатгалын бүтээгдэхүүн бүрд хамаарах нэмэлт
            үйлчилгээ болон боломжуудтай танилцаарай.
          </p>

          {!loading && !error && addService.length > 0 && (
            <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-red-100 bg-white px-4 py-2.5 shadow-sm">
              <Package size={18} className="text-red-600" />

              <span className="text-sm text-gray-600">
                Нийт бүтээгдэхүүн:
              </span>

              <span className="font-bold text-gray-900">
                {addService.length}
              </span>
            </div>
          )}
        </header>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white py-16">
            <div className="mb-4 h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-red-600" />

            <p className="text-sm text-gray-500">
              Үйлчилгээнүүдийг ачаалж байна...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={22}
                className="shrink-0 text-red-600"
              />

              <div>
                <h3 className="font-semibold text-red-700">
                  Ачааллахад алдаа гарлаа
                </h3>

                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>

                <p className="mt-2 text-xs text-red-500">
                  Backend сервер localhost:3000 дээр ажиллаж
                  байгаа эсэхийг шалгана уу.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Product list */}
        {!loading && !error && addService.length > 0 && (
          <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2">
            {addService.filter((service) =>
              Array.isArray(service.additionalServices) && service.additionalServices.some(
                (item) => typeof item === "string" && item.trim() !== "")).map((service) => {
              const isExpanded =
                expandedService === service._id;

              const additionalServices = Array.isArray(service.additionalServices) ? service.additionalServices : [];

              return (
                <article
                  key={service._id}
                  className="group min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-red-200 hover:shadow-md sm:p-6"
                >
                  {/* Product header */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 transition-colors duration-200 group-hover:bg-red-600 group-hover:text-white">
                      {getCategoryIcon(service.category)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="mb-2 inline-flex max-w-full rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                        {service.category || "Бусад"}
                      </span>

                      <h2 className="break-words text-lg font-bold leading-6 text-gray-900">
                        {service.name || "Нэргүй бүтээгдэхүүн"}
                      </h2>

                      {service.description && (
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-500">
                          {service.description}
                        </p>
                      )}  
                    </div>
                  </div>

                  {/* Additional services toggle */}
                  <div className="mt-5 border-t border-gray-100 pt-3">
                    <button
                      type="button"
                      onClick={() => toggleService(service._id)}
                      aria-expanded={isExpanded}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left transition-colors duration-200 ${
                        isExpanded
                          ? "bg-red-50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <CheckCircle2
                          size={19}
                          className="shrink-0 text-red-600"
                        />

                        <span className="text-sm font-semibold text-gray-800">
                          Нэмэлт үйлчилгээ
                        </span>

                        <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                          {additionalServices.length}
                        </span>
                      </span>

                      <ChevronDown
                        size={20}
                        className={`shrink-0 text-gray-500 transition-transform duration-300 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Expandable content */}
                    <div
                      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                        isExpanded
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <div className="space-y-3 px-1 pb-1 pt-3">
                          {additionalServices.length > 0 ? (
                            additionalServices.map(
                              (item, index) => (
                                <div
                                  key={`${service._id}-${index}`}
                                  className="flex items-start gap-3 rounded-xl border border-green-100 bg-green-50/70 p-3"
                                >
                                  <CheckCircle2
                                    size={19}
                                    className="mt-0.5 shrink-0 text-green-600"
                                  />

                                  <p className="break-words text-sm leading-6 text-gray-700">
                                    {item}
                                  </p>
                                </div>
                              )
                            )
                          ) : (
                            <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-400">
                              Нэмэлт үйлчилгээ бүртгэгдээгүй
                              байна.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && addService.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
              <ShieldCheck
                size={30}
                className="text-gray-400"
              />
            </div>

            <h3 className="font-semibold text-gray-800">
              Даатгалын бүтээгдэхүүн олдсонгүй
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Бүртгэлтэй даатгалын бүтээгдэхүүнүүд энд харагдана.
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

export default Additional;
