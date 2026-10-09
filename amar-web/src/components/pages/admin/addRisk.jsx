import React, { useState } from "react";
import {
  ShieldAlert,
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
} from "lucide-react";

const riskTypes = [
  "Гал түймэр",
  "Цахилгаан",
  "Сантехник",
  "Газар хөдлөлт",
  "Үер",
  "Хулгай",
  "Гэнэтийн осол",
  "Бусад",
];

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
});

const AddRisk = () => {
  const [organization, setOrganization] = useState("");
  const [risks, setRisks] = useState([initialRisk()]);
  const [searchTerm, setSearchTerm] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const addRisk = () => {
    setRisks((prev) => [...prev, initialRisk()]);
    setSaved(false);
    setError("");
  };

  const removeRisk = (id) => {
    setRisks((prev) => prev.filter((risk) => risk.id !== id));
    setSaved(false);
    setError("");
  };

  const updateRisk = (id, field, value) => {
    setRisks((prev) =>
      prev.map((risk) =>
        risk.id === id ? { ...risk, [field]: value } : risk
      )
    );
    setSaved(false);
    setError("");
  };

  const filteredRisks = risks.filter((risk) => {
    const query = searchTerm.toLowerCase();
    return (
      risk.name.toLowerCase().includes(query) ||
      risk.type.toLowerCase().includes(query) ||
      risk.location.toLowerCase().includes(query)
    );
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!organization.trim()) {
      setError("Байгууллагын нэрээ оруулна уу.");
      return;
    }

    const incomplete = risks.some(
      (risk) => !risk.name.trim() || !risk.location.trim()
    );

    if (incomplete) {
      setError(
        "Үнэлгээ бүрийн нэр болон байршлыг бүрэн бөглөнө үү."
      );
      return;
    }

    const payload = {
      organization: organization.trim(),
      risks: risks.map(({ id, ...risk }) => ({
        ...risk,
        score: Number(risk.score),
        level: getRiskLevel(Number(risk.score)),
      })),
    };

    // Одоогоор backend-д хадгалахгүй.
    // API холбох үед энэ хэсэгт POST хүсэлт хийнэ.
    console.log("Эрсдэлийн үнэлгээ:", payload);

    setSaved(true);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
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
              placeholder="Жишээ: Баатарван амралт сувилал"
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
            {filteredRisks.map((risk, index) => {
              const Icon =
                risk.type === "Гал түймэр"
                  ? Flame
                  : risk.type === "Цахилгаан"
                  ? Zap
                  : risk.type === "Үер" ||
                    risk.type === "Сантехник"
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
                    {/* NAME */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Үнэлгээний нэр{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={risk.name}
                        onChange={(e) =>
                          updateRisk(risk.id, "name", e.target.value)
                        }
                        placeholder="Жишээ: Галын аюулгүй байдлын үнэлгээ"
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-50"
                      />
                    </div>

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

                    {/* LOCATION */}
                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Байршил <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={risk.location}
                        onChange={(e) =>
                          updateRisk(risk.id, "location", e.target.value)
                        }
                        placeholder="Жишээ: Үндсэн байр, 1-р давхар"
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-50"
                      />
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
                            updateRisk(
                              risk.id,
                              "score",
                              Number(e.target.value)
                            )
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
                          updateRisk(
                            risk.id,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Илэрсэн эрсдэл, шалтгаан болон авах арга хэмжээ..."
                        className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-gray-400 focus:border-red-400 focus:ring-4 focus:ring-red-50"
                      />
                    </div>
                  </div>
                </section>
              );
            })}

            {filteredRisks.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-12 text-center">
                <Search className="mx-auto mb-3 text-gray-300" size={32} />
                <p className="font-semibold text-gray-700">
                  Тохирох эрсдэл олдсонгүй
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  Хайлтын үгээ өөрчилж үзнэ үү.
                </p>
              </div>
            )}
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

          {/* ERROR / SUCCESS */}
          {error && (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
              {error}
            </div>
          )}

          {saved && (
            <div
              role="status"
              className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
            >
              <CheckCircle2 size={20} className="shrink-0" />
              <div>
                <p className="font-bold">
                  Мэдээлэл шалгалтад тэнцлээ!
                </p>
                <p className="mt-1">
                  Одоогоор мэдээлэл зөвхөн console-д бэлтгэгдсэн. Өгөгдлийн
                  санд хадгалахын тулд backend API холбоно уу.
                </p>
              </div>
            </div>
          )}

          {/* FOOTER ACTIONS */}
          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-gray-400">
              Нийт {risks.length} эрсдэлийн үнэлгээ
              <br />
              * тэмдэгтэй талбаруудыг заавал бөглөнө.
            </p>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-200 transition hover:-translate-y-0.5 hover:bg-red-700"
            >
              <Save size={18} />
              Бүх үнэлгээг хадгалах
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRisk;
