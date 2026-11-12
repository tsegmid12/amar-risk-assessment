import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  ShieldAlert,
  ShieldCheck,
  Plus,
  Trash2,
  Save,
  ClipboardList,
  Flame,
  Zap,
  Droplets,
  Activity,
  Search,
  CheckCircle2,
  ChevronDown,
  Check,
  Upload,
  X,
} from "lucide-react";

const riskTypes = [
  "Гал түймэр",
  "Цахилгаан",
  "Сантехник",
  "Тэсрэлт, дэлбэрэлт",
  "Газар хөдлөлт",
  "Үер",
  "Хулгай, дээрэм",
  "Гэнэтийн осол",
  "Бусад",
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // backend-ийн limit-тэй ижил (5MB)

const getRiskLevel = (score) => {
  if (score <= 30) return "Бага";
  if (score <= 40) return "Дунд";
  if (score <= 60) return "Их";
  return "Маш их";
};

const getRiskColor = (score) => {
  if (score <= 30) return "text-emerald-600 bg-emerald-50";
  if (score <= 40) return "text-yellow-700 bg-yellow-50";
  if (score <= 60) return "text-orange-600 bg-orange-50";
  return "text-red-600 bg-red-50";
};

const initialRisk = () => ({
  id: crypto.randomUUID(),
  name: "",
  type: "Гал түймэр",
  score: 30,
  description: "",
  location: "",
  files: []
});

// Зургийн preview: object URL үүсгээд, хэрэггүй болоход чөлөөлнө (memory leak-ээс сэргийлнэ)
const ImagePreview = ({ file, onRemove }) => {
  const [url, setUrl] = useState("");

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div className="relative h-20 w-20">
      {url && (
        <img
          src={url}
          alt={file.name}
          className="h-20 w-20 rounded-lg border border-gray-200 object-cover"
        />
      )}
      <button
        type="button"
        onClick={onRemove}
        title="Зураг хасах"
        className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700"
      >
        <X size={12} />
      </button>
    </div>
  );
};

const AddRisk = () => {
  const [organization, setOrganization] = useState("");
  const [orgLocation, setOrgLocation] = useState("");
  const [orgEmail, setOrgEmail] = useState("");
  const [risks, setRisks] = useState([initialRisk()]);
  const [searchTerm, setSearchTerm] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [insurance, setInsurance] = useState([]);
  const [selectedInsurance, setSelectedInsurance] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  // token байхгүй эсвэл эвдэрсэн үед компонент унахгүй
  let userId = null;
  try {
    userId = token ? jwtDecode(token)?.id : null;
  } catch {
    userId = null;
  }

  useEffect(() => {
    const fetchInsurance = async () => {
      try {
        const response = await axios.get(`${API_URL}/insurance-products`);
        setInsurance(response.data);
      } catch (err) {
        console.error("Error fetching insurance data:", err);
      }
    };
    fetchInsurance();
  }, [API_URL]);

  const addRisk = () => {
    setRisks((prev) => [...prev, initialRisk()]);
    setSaved(false);
    setError("");
  };

  const removeRisk = (riskId) => {
    setRisks((prev) => prev.filter((risk) => risk.id !== riskId));
    setSaved(false);
    setError("");
  };

  const updateRisk = (riskId, field, value) => {
    setRisks((prev) =>
      prev.map((risk) =>
        risk.id === riskId ? { ...risk, [field]: value } : risk
      )
    );
    setSaved(false);
    setError("");
  };

  // Сонгосон файлуудыг одоо байгаа жагсаалтад нэмнэ (хэмжээ/төрлийг шалгана)
  const addFiles = (riskId, fileList) => {
    const incoming = Array.from(fileList);
    const valid = [];

    for (const file of incoming) {
      if (!file.type.startsWith("image/")) {
        setError(`"${file.name}" зураг биш байна.`);
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        setError(`"${file.name}" 5MB-аас том байна.`);
        continue;
      }
      valid.push(file);
    }

    if (valid.length === 0) return;

    setRisks((prev) =>
      prev.map((risk) =>
        risk.id === riskId
          ? { ...risk, files: [...risk.files, ...valid] }
          : risk
      )
    );
    setSaved(false);
  };

  const removeFile = (riskId, index) => {
    setRisks((prev) =>
      prev.map((risk) =>
        risk.id === riskId
          ? { ...risk, files: risk.files.filter((_, i) => i !== index) }
          : risk
      )
    );
  };

  const filteredRisks = risks.filter((risk) =>
    risk.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInsurance = insurance.filter((item) => {
    const query = search.toLowerCase();
    const categoryText = Array.isArray(item.category)
      ? item.category.join(" ")
      : item.category || "";
    return (
      (item.name || "").toLowerCase().includes(query) ||
      (item.description || "").toLowerCase().includes(query) ||
      categoryText.toLowerCase().includes(query)
    );
  });

  // Нэг зургийг /upload руу илгээж, буцсан _id-г авна
  const uploadImages = async (files) => {
    const ids = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append("image", file); // backend-ийн upload.single("image")-тэй ижил нэр
      const res = await axios.post(`${API_URL}/upload`, formData, {
        // Content-Type-ийг гараар ТАВИХГҮЙ: browser өөрөө boundary-тай тавина
        headers: { Authorization: `Bearer ${token}` },
      });
      ids.push(res.data._id);
    }
    return ids;
  };

  const resetForm = () => {
    setOrganization("");
    setOrgLocation("");
    setOrgEmail("");
    setRisks([initialRisk()]);
    setSelectedInsurance([]);
    setSearchTerm("");
    setSearch("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token || !userId) {
      setError("Нэвтрээгүй байна. Дахин нэвтэрнэ үү.");
      return;
    }
    if (!organization.trim()) {
      setError("Байгууллагын нэрээ оруулна уу.");
      return;
    }
    if (!orgLocation.trim()) {
      setError("Байгууллагын байршлаа оруулна уу.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      // 1. Эрсдэл бүрийн зургийг upload хийж, ID-г нь авна
      const risksPayload = await Promise.all(
        risks.map(async ({ id, files, ...risk }) => ({
          ...risk,
          score: Number(risk.score),
          level: getRiskLevel(Number(risk.score)),
          images: await uploadImages(files),
        }))
      );

      // 2. Үнэлгээг илгээнэ
      const payload = {
        organization: organization.trim(),
        selectedInsurance,
        orgEmail: orgEmail.trim(),
        user: userId,
        location: orgLocation.trim(),
        risks: risksPayload,
      };

      await axios.post(`${API_URL}/risk-assessments`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      resetForm();
      setSaved(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSaved(false);
      setError(
        err.response?.data?.message ||
          (err.code === "ERR_NETWORK"
            ? "Сервертэй холбогдож чадсангүй."
            : "Алдаа гарлаа.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto w-full min-w-0 space-y-7 p-4 sm:p-6 md:px-8 lg:p-10 lg:pl-85 lg:pr-20">
        {/* PAGE HEADER */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-400">
              <ClipboardList size={16} />
              <span>Админ</span>
              <span>/</span>
              <span className="text-red-600">Эрсдэлийн үнэлгээ</span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
              Эрсдэлийн үнэлгээ нэмэх
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Байгууллагын эрсдэлийг бүртгэж, үнэлгээнүүдээ нэг дор удирдаарай.
            </p>
          </div>

          <button
            type="button"
            onClick={addRisk}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-200 transition hover:-translate-y-0.5 hover:bg-red-700 active:translate-y-0"
          >
            <Plus size={19} />
            Эрсдэл нэмэх
          </button>
        </div>

        {/* SUCCESS (хуудасны дээд хэсэгт, form цэвэрлэгдсэний дараа харагдана) */}
        {saved && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            <CheckCircle2 size={20} className="shrink-0" />
            <p className="font-bold">Эрсдэлийн үнэлгээ амжилттай нэмэгдлээ!</p>
          </div>
        )}

        {/* SUMMARY CARDS */}
        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <ShieldAlert size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Нийт үнэлгээ</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {risks.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Дундаж эрсдэлийн оноо</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {Math.round(
                  risks.reduce((sum, risk) => sum + Number(risk.score), 0) /
                    Math.max(risks.length, 1)
                )}
                <span className="ml-1 text-sm font-medium text-gray-400">
                  /100
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Маш их эрсдэл</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {risks.filter((risk) => Number(risk.score) > 60).length}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ORGANIZATION */}
          <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <ClipboardList size={21} />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">
                  Байгууллагын мэдээлэл
                </h2>
                <p className="mt-1 text-xs text-gray-400">
                  Үнэлгээ хийх байгууллагын нэр
                </p>
              </div>
            </div>

            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Байгууллагын нэр <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={organization}
              onChange={(e) => {
                setOrganization(e.target.value);
                setSaved(false);
                setError("");
              }}
              placeholder="Байгууллагын нэр оруулна уу"
              className="mb-4 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-50"
            />

            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Байгууллагын байршил <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={orgLocation}
              onChange={(e) => {
                setOrgLocation(e.target.value);
                setSaved(false);
                setError("");
              }}
              placeholder="Байгууллагын байршил оруулна уу"
              className="mb-4 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-50"
            />

            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Байгууллагын имэйл
            </label>
            <input
              type="email"
              value={orgEmail}
              onChange={(e) => {
                setOrgEmail(e.target.value);
                setSaved(false);
                setError("");
              }}
              placeholder="Байгууллагын имэйл оруулна уу"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-50"
            />
          </section>

          {/* RISK LIST HEADER */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Эрсдэлийн жагсаалт
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {risks.length} эрсдэлийн үнэлгээ бүртгэгдсэн
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Эрсдэл хайх..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
              />
            </div>
          </div>

          {/* RISK CARDS */}
          <div className="space-y-5">
            {filteredRisks.map((risk) => {
              const Icon =
                risk.type === "Гал түймэр"
                  ? Flame
                  : risk.type === "Цахилгаан"
                  ? Zap
                  : risk.type === "Үер" || risk.type === "Сантехник"
                  ? Droplets
                  : ShieldAlert;

              return (
                <section
                  key={risk.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:border-gray-300 hover:shadow-md"
                >
                  {/* CARD HEADER */}
                  <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-5 py-4 sm:px-7">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
                        <Icon size={21} />
                      </div>

                      <div>
                        <h3 className="font-bold text-gray-900">
                          Эрсдэлийн үнэлгээ{" "}
                          {risks.findIndex((item) => item.id === risk.id) + 1}
                        </h3>
                        <p className="mt-1 text-xs text-gray-400">
                          Эрсдэлийн мэдээлэл
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeRisk(risk.id)}
                      disabled={risks.length === 1}
                      title={
                        risks.length === 1
                          ? "Хамгийн багадаа нэг үнэлгээ үлдэнэ"
                          : "Үнэлгээ устгах"
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* CARD BODY */}
                  <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-7">
                    {/* TYPE */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Эрсдэлийн төрөл
                      </label>
                      <div className="relative">
                        <select
                          value={risk.type}
                          onChange={(e) =>
                            updateRisk(risk.id, "type", e.target.value)
                          }
                          className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 pr-10 text-sm outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-50"
                        >
                          {riskTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={17}
                          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                      </div>
                    </div>

                    {/* SCORE */}
                    <div className="sm:col-span-2">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <label className="text-sm font-semibold text-gray-700">
                          Эрсдэлийн оноо
                        </label>

                        <span
                          className={`rounded-lg px-3 py-1.5 text-xs font-bold ${getRiskColor(
                            Number(risk.score)
                          )}`}
                        >
                          {getRiskLevel(Number(risk.score))}
                        </span>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-4 sm:p-5">
                        <div className="mb-4 flex items-end justify-between">
                          <span className="text-sm text-gray-500">
                            Эрсдэлийн түвшин
                          </span>
                          <span className="text-3xl font-extrabold text-gray-900">
                            {risk.score}
                            <span className="ml-1 text-sm font-medium text-gray-400">
                              /100
                            </span>
                          </span>
                        </div>

                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={risk.score}
                          onChange={(e) =>
                            updateRisk(risk.id, "score", Number(e.target.value))
                          }
                          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-100 accent-red-600"
                        />

                        <div className="mt-3 flex justify-between text-[11px] font-medium text-gray-400">
                          <span>0 · Бага</span>
                          <span>31 · Дунд</span>
                          <span>41 · Их</span>
                          <span>61 · Маш их</span>
                          <span>100</span>
                        </div>
                      </div>
                    </div>

                    {/* DESCRIPTION */}
                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Дэлгэрэнгүй тайлбар
                      </label>
                      <textarea
                        rows={3}
                        value={risk.description}
                        onChange={(e) =>
                          updateRisk(risk.id, "description", e.target.value)
                        }
                        placeholder="Илэрсэн эрсдэл, шалтгаан болон авах арга хэмжээ..."
                        className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-gray-400 focus:border-red-400 focus:ring-4 focus:ring-red-50"
                      />
                    </div>

                    {/* IMAGES */}
                    <div className="sm:col-span-2">
                      
                      <label className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/70 px-6 py-8 transition hover:border-red-300 hover:bg-red-50/40">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-red-500 shadow-sm transition group-hover:scale-110">
                          <Upload size={22} />
                        </div>

                        <div className="text-center">
                          <p className="text-sm font-semibold text-gray-700">
                            Зураг оруулах
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            PNG, JPG, WEBP · Олон зураг сонгох боломжтой
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            <span className="font-bold text-red-600">*</span> 5MB-аас хэтрэлсэн зураг оруулах боломжгүй
                            </p>
                        </div>

                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            addFiles(risk.id, e.target.files);
                            e.target.value = "";
                          }}
                        />
                      </label>


                      {risk.files.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-3">
                          {risk.files.map((file, i) => (
                            <ImagePreview
                              key={`${file.name}-${file.lastModified}-${i}`}
                              file={file}
                              onRemove={() => removeFile(risk.id, i)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>

          {/* ADD ANOTHER RISK */}
          <button
            type="button"
            onClick={addRisk}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-red-200 bg-red-50/50 py-5 text-sm font-bold text-red-600 transition hover:border-red-400 hover:bg-red-50"
          >
            <Plus size={20} />
            Дараагийн эрсдэлийн үнэлгээ нэмэх
          </button>

          {/* INSURANCE PRODUCTS */}
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-col justify-between gap-2 border-b border-gray-100 bg-linear-to-r from-gray-50/80 to-white px-5 py-4 sm:flex-row sm:items-center sm:px-7">
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Даатгалын бүтээгдэхүүн
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Тохирох даатгалуудаа сонгоно уу
                  </p>
                </div>
                <input
                  type="text"
                  placeholder="Бүтээгдэхүүн хайх..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {insurance.length > 0 ? (
                <ul className="max-h-120 divide-y divide-gray-100 overflow-y-auto">
                  {filteredInsurance.map((item, index) => {
                    const isSelected = selectedInsurance.includes(item._id);

                    const categories = Array.isArray(item.category)
                      ? item.category
                      : item.category
                      ? [item.category]
                      : [];

                    return (
                      <li
                        key={item._id}
                        style={{
                          animation: `insuranceEnter 400ms ease-out ${
                            index * 60
                          }ms both`,
                        }}
                        className={`group transition-colors duration-300 ${
                          isSelected
                            ? "bg-red-50/40"
                            : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        <button
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => {
                            setSelectedInsurance((prev) =>
                              prev.includes(item._id)
                                ? prev.filter((pid) => pid !== item._id)
                                : [...prev, item._id]
                            );
                          }}
                          className="flex w-full items-center gap-4 px-5 py-4 text-left sm:px-7"
                        >
                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                              isSelected
                                ? "scale-105 bg-red-100 text-red-600"
                                : "bg-gray-100 text-gray-500 group-hover:bg-red-50 group-hover:text-red-500"
                            }`}
                          >
                            <ShieldCheck
                              size={22}
                              strokeWidth={1.8}
                              className="transition-transform duration-300 group-hover:scale-110"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p
                              className={`wrap-break-word text-sm font-semibold transition-colors duration-200 sm:text-base ${
                                isSelected
                                  ? "text-red-700"
                                  : "text-gray-900 group-hover:text-red-700"
                              }`}
                            >
                              {item.name || "Нэргүй бүтээгдэхүүн"}
                            </p>

                            {categories.length > 0 && (
                              <div className="mt-1.5 flex flex-wrap gap-1.5">
                                {categories.map((category, i) => (
                                  <span
                                    key={`${category}-${i}`}
                                    className={`rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${
                                      isSelected
                                        ? "bg-red-100 text-red-700"
                                        : "bg-gray-100 text-gray-500"
                                    }`}
                                  >
                                    {category}
                                  </span>
                                ))}
                              </div>
                            )}

                            {item.description && (
                              <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-gray-500">
                                {item.description}
                              </p>
                            )}
                          </div>

                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${
                              isSelected
                                ? "scale-100 rotate-0 border-red-500 bg-red-500 text-white shadow-md shadow-red-500/20"
                                : "border-gray-200 bg-white text-gray-400 group-hover:scale-105 group-hover:border-red-300 group-hover:text-red-500"
                            }`}
                          >
                            {isSelected ? (
                              <Check
                                size={19}
                                strokeWidth={2.8}
                                className="animate-[checkPop_250ms_ease-out]"
                              />
                            ) : (
                              <Plus
                                size={19}
                                className="transition-transform duration-300 group-hover:rotate-90"
                              />
                            )}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="px-5 py-12 text-center sm:px-7">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
                    <ShieldCheck size={27} />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-gray-700">
                    Бүтээгдэхүүн олдсонгүй
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Даатгалын бүтээгдэхүүн нэмсний дараа энд харагдана.
                  </p>
                </div>
              )}

              {insurance.length > 0 && (
                <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/70 px-5 py-3.5 sm:px-7">
                  <p className="text-xs text-gray-500">Сонгосон бүтээгдэхүүн</p>

                  <span
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors duration-300 ${
                      selectedInsurance.length > 0
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {selectedInsurance.length} сонгосон
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
              {error}
            </div>
          )}

          {/* FOOTER ACTIONS */}
          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-gray-400">
              Нийт {risks.length} эрсдэлийн үнэлгээ
              <br />* тэмдэгтэй талбаруудыг заавал бөглөнө.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-200 transition hover:-translate-y-0.5 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={18} />
              {loading ? "Хадгалж байна..." : "Хадгалах"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRisk;