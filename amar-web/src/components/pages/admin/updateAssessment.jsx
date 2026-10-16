
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  SquarePen,
  MapPinned,
  Building2,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;    
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

const UpdateAssessment = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [org, setOrg] = useState("");
  const [location, setLocation] = useState("");
  const [selectedInsurance, setSelectedInsurance] = useState([]);
  const [risks, setRisks] = useState([]);
  const [insuranceProducts, setInsuranceProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Үнэлгээ болон даатгалын бүтээгдэхүүн татах
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [assessmentRes, insuranceRes] = await Promise.all([
          axios.get(`${API}/riskAssessments/${id}`),
          axios.get(`${API}/insurance-products`),
        ]);

        const data = assessmentRes.data;
        setAssessment(data);

        setOrg(data.organization || "");
        setLocation(data.location || "");

        // ObjectId эсвэл populate хийсэн object аль нь ч байсан ажиллана
        setSelectedInsurance(
          (data.selectedInsurance || []).map((item) =>
            typeof item === "object" ? item._id : item
          )
        );

        setRisks(
          (data.risks || []).map((risk) => ({
            ...risk,
            type: risk.type || "",
            score: risk.score ?? 0,
            description: risk.description || "",
            location: risk.location || "",
            level: risk.level || "",
          }))
        );

        setInsuranceProducts(
          Array.isArray(insuranceRes.data)
            ? insuranceRes.data
            : insuranceRes.data.products || []
        );
      } catch (err) {
        console.error("Мэдээлэл татахад алдаа:", err);
        setError(
          err.response?.data?.message ||
            "Мэдээлэл татаж чадсангүй. API замаа шалгана уу."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  // Эрсдэл нэмэх
  const addRisk = () => {
    setRisks((prev) => [
      ...prev,
      {
        type: "",
        score: 0,
        description: "",
        location: "",
        level: "",
      },
    ]);
  };

  // Эрсдэлийн талбар шинэчлэх
  const updateRisk = (index, field, value) => {
    setRisks((prev) =>
      prev.map((risk, i) =>
        i === index ? { ...risk, [field]: value } : risk
      )
    );
  };

  // Эрсдэл устгах
  const removeRisk = (index) => {
    setRisks((prev) => prev.filter((_, i) => i !== index));
  };

  // Даатгал сонгох / болиулах
  const toggleInsurance = (insuranceId) => {
    setSelectedInsurance((prev) =>
      prev.includes(insuranceId)
        ? prev.filter((item) => item !== insuranceId)
        : [...prev, insuranceId]
    );
  };

  // Эрсдэлийн түвшинг оноогоор шинэчлэх
  const getLevel = (score) => {
    if (score <= 30) return "Бага";
    if (score <= 40) return "Дунд";
    if (score <= 60) return "Их";
    return "Маш их";
  };

  
  // MongoDB руу шинэчлэх
  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");

    if (!org.trim() || !location.trim()) {
      setError("Байгууллагын нэр болон байршлыг бөглөнө үү.");
      return;
    }

    if (selectedInsurance.length === 0) {
      setError("Дор хаяж нэг даатгалын бүтээгдэхүүн сонгоно уу.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        organization: org.trim(),
        location: location.trim(),
        selectedInsurance,
        risks: risks.map((risk) => ({
          type: risk.type,
          score: Number(risk.score),
          description: risk.description,
          location: risk.location,
          level: getLevel(Number(risk.score)),
        })),
      };

      const response = await axios.put(
        `${API}/riskAssessments/${id}`,
        payload
      );

      setAssessment(response.data);
      alert("Эрсдэлийн үнэлгээг амжилттай шинэчиллээ.");
      navigate(-1);
    } catch (err) {
      console.error("Шинэчлэхэд алдаа:", err);
      setError(
        err.response?.data?.message ||
          "Шинэчлэхэд алдаа гарлаа. Backend API-гаа шалгана уу."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        Мэдээлэл ачаалж байна...
      </div>
    );
  }

  if (!assessment && error) {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 flex items-center gap-2 rounded-lg border px-4 py-2"
        >
          <ArrowLeft size={18} />
          Буцах
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-10">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-3 text-sm text-gray-400">
            Админ / Эрсдэлийн үнэлгээ /
            <span className="ml-1 font-medium text-red-500">
              Шинэчлэх
            </span>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
            Эрсдэлийн үнэлгээг шинэчлэх
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Байгууллага, даатгал болон эрсдэлийн мэдээллийг засварлана.
          </p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          {/* Байгууллагын мэдээлэл */}
          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-900">
              <Building2 className="text-red-500" size={22} />
              Байгууллагын мэдээлэл
            </h2>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Байгууллагын нэр
                </label>
                <input
                  value={org}
                  onChange={(e) => setOrg(e.target.value)}
                  required
                  placeholder="Байгууллагын нэр"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Байршил
                </label>
                <div className="relative">
                  <MapPinned
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    placeholder="Байгууллагын байршил"
                    className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-50"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Даатгалын бүтээгдэхүүн */}
          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="mb-2 flex items-center gap-2 text-lg font-bold text-gray-900">
              <ShieldCheck className="text-red-500" size={22} />
              Сонгосон даатгал
            </h2>
            <p className="mb-5 text-sm text-gray-500">
              Шаардлагатай бүтээгдэхүүнүүдийг сонгоно уу.
            </p>

            {insuranceProducts.length === 0 ? (
              <p className="text-sm text-gray-400">
                Даатгалын бүтээгдэхүүн олдсонгүй.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 overflow-auto max-h-80" >
                {insuranceProducts.map((product) => (
                  <label
                    key={product._id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                      selectedInsurance.includes(product._id)
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedInsurance.includes(product._id)}
                      onChange={() => toggleInsurance(product._id)}
                      className="mt-1 accent-red-500"
                    />
                    <span className="min-w-0">
                      <span className="block font-semibold text-gray-800">
                        {product.name}
                      </span>
                      
                    </span>
                  </label>
                ))}
              </div>
            )}
          </section>

          {/* Эрсдэлийн мэдээлэл */}
          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Эрсдэлийн мэдээлэл
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Нийт {risks.length} эрсдэл
                </p>
              </div>

              <button
                type="button"
                onClick={addRisk}
                className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
              >
                <Plus size={18} />
                Эрсдэл нэмэх
              </button>
            </div>

            {risks.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-300 py-10 text-center text-sm text-gray-400">
                Эрсдэлийн мэдээлэл алга. Эрсдэл нэмэх товчийг дарна уу.
              </div>
            )}

            <div className="space-y-5">
              {risks.map((risk, index) => (
                <div
                  key={risk._id || index}
                  className="rounded-xl border border-gray-200 p-4 sm:p-5"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-bold text-gray-800">
                      Эрсдэл #{index + 1}
                    </h3>

                    <button
                      type="button"
                      onClick={() => removeRisk(index)}
                      aria-label="Эрсдэл устгах"
                      className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-600">
                        Эрсдэлийн төрөл
                      </label>

                        <select
                        value={risk.type}
                        onChange={(e) => updateRisk(index, "type", e.target.value)}
                        required
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-50"
                        >
                        <option value="" disabled>
                            Эрсдэлийн төрөл сонгох
                        </option>

                        {riskTypes.map((type) => (
                            <option key={type} value={type}>
                            {type}
                            </option>
                        ))}
                        </select>

                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-600">
                        Эрсдэлийн оноо (0–100)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={risk.score}
                        onChange={(e) =>
                          updateRisk(
                            index,
                            "score",
                            e.target.value === ""
                              ? ""
                              : Math.min(100, Math.max(0, Number(e.target.value)))
                          )
                        }
                        required
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-red-400"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Түвшин:{" "}
                        <span className="font-semibold text-red-500">
                          {risk.score === ""
                            ? "Оноо оруулна уу"
                            : getLevel(Number(risk.score))}
                        </span>
                      </p>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-600">
                        Эрсдэлийн байршил
                      </label>
                      <input
                        value={risk.location}
                        onChange={(e) =>
                          updateRisk(index, "location", e.target.value)
                        }
                        placeholder="Жишээ: Үндсэн барилга"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-red-400"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-600">
                        Тайлбар
                      </label>
                      <input
                        value={risk.description}
                        onChange={(e) =>
                          updateRisk(index, "description", e.target.value)
                        }
                        placeholder="Эрсдэлийн тайлбар"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-red-400"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Алдааны мэдээлэл */}
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {/* Үйлдлүүд */}
          <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              <ArrowLeft size={18} />
              Буцах
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl bg-red-500 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={18} />
              {saving ? "Хадгалж байна..." : "Өөрчлөлт хадгалах"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateAssessment;
