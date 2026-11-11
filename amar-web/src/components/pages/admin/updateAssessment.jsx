import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPinned,
  Building2,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  ShieldCheck,
  ImagePlus,
  X,
} from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // backend-ийн limit-тэй ижил (5MB)

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

// images нь ID string эсвэл populate хийсэн объект байж болно
const getImageId = (image) =>
  typeof image === "string" ? image : image?._id;

const getImageUrl = (image) => {
  const imageId = getImageId(image);
  return imageId ? `${API_URL}/images/${imageId}` : "";
};

const getLevel = (score) => {
  if (score <= 30) return "Бага";
  if (score <= 40) return "Дунд";
  if (score <= 60) return "Их";
  return "Маш их";
};

// Шинээр сонгосон файлын preview (object URL-ийг чөлөөлнө)
const NewImagePreview = ({ file, onRemove }) => {
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
          className="h-20 w-20 rounded-lg border-2 border-emerald-300 object-cover"
        />
      )}
      <span className="absolute bottom-0 left-0 rounded-tr-md rounded-bl-lg bg-emerald-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
        Шинэ
      </span>
      <button
        type="button"
        onClick={onRemove}
        title="Хасах"
        className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700"
      >
        <X size={12} />
      </button>
    </div>
  );
};

// Өмнө хадгалагдсан зураг
const ExistingImage = ({ image, onRemove }) => {
  const url = getImageUrl(image);
  if (!url) return null;

  return (
    <div className="relative h-20 w-20">
      <img
        src={url}
        alt="Хадгалагдсан зураг"
        loading="lazy"
        className="h-20 w-20 rounded-lg border border-gray-200 object-cover"
      />
      <button
        type="button"
        onClick={onRemove}
        title="Зураг устгах"
        className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700"
      >
        <X size={12} />
      </button>
    </div>
  );
};

const newRisk = () => ({
  _key: crypto.randomUUID(),
  name: "",
  type: "",
  score: 0,
  description: "",
  location: "",
  level: "",
  images: [], // хадгалагдсан зургийн ID-ууд
  newFiles: [], // шинээр сонгосон File объектууд (зөвхөн frontend дээр)
});

const UpdateAssessment = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [org, setOrg] = useState("");
  const [location, setLocation] = useState("");
  const [orgEmail, setOrgEmail] = useState("");
  const [selectedInsurance, setSelectedInsurance] = useState([]);
  const [risks, setRisks] = useState([]);
  const [insuranceProducts, setInsuranceProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  const filteredData = insuranceProducts.filter((product) =>
    (product.name || "").toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [assessmentRes, insuranceRes] = await Promise.all([
          axios.get(`${API_URL}/riskAssessments/${id}`),
          axios.get(`${API_URL}/insurance-products`),
        ]);

        const data = assessmentRes.data;
        setAssessment(data);

        setOrg(data.organization || "");
        setLocation(data.location || "");
        setOrgEmail(data.orgEmail || "");

        // ObjectId эсвэл populate хийсэн object аль нь ч байсан ажиллана
        setSelectedInsurance(
          (data.selectedInsurance || []).map((item) =>
            typeof item === "object" ? item._id : item
          )
        );

        setRisks(
          (data.risks || []).map((risk) => ({
            ...risk,
            _key: risk._id || crypto.randomUUID(),
            name: risk.name || "",
            type: risk.type || "",
            score: risk.score ?? 0,
            description: risk.description || "",
            location: risk.location || "",
            level: risk.level || "",
            images: (risk.images || []).map(getImageId).filter(Boolean),
            newFiles: [],
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

  const addRisk = () => setRisks((prev) => [...prev, newRisk()]);

  const updateRisk = (index, field, value) => {
    setRisks((prev) =>
      prev.map((risk, i) => (i === index ? { ...risk, [field]: value } : risk))
    );
  };

  const removeRisk = (index) => {
    setRisks((prev) => prev.filter((_, i) => i !== index));
  };

  // Шинэ зураг нэмэх (төрөл, хэмжээг шалгана)
  const addNewFiles = (index, fileList) => {
    const valid = [];

    for (const file of Array.from(fileList)) {
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
      prev.map((risk, i) =>
        i === index ? { ...risk, newFiles: [...risk.newFiles, ...valid] } : risk
      )
    );
  };

  const removeNewFile = (riskIndex, fileIndex) => {
    setRisks((prev) =>
      prev.map((risk, i) =>
        i === riskIndex
          ? { ...risk, newFiles: risk.newFiles.filter((_, f) => f !== fileIndex) }
          : risk
      )
    );
  };

  // Хадгалагдсан зургийг эрсдэлээс салгана (submit хийгээгүй бол хадгалагдахгүй)
  const removeExistingImage = (riskIndex, imageId) => {
    setRisks((prev) =>
      prev.map((risk, i) =>
        i === riskIndex
          ? { ...risk, images: risk.images.filter((img) => img !== imageId) }
          : risk
      )
    );
  };

  const toggleInsurance = (insuranceId) => {
    setSelectedInsurance((prev) =>
      prev.includes(insuranceId)
        ? prev.filter((item) => item !== insuranceId)
        : [...prev, insuranceId]
    );
  };

  // Нэг зургийг /upload руу илгээж, ID-г нь авна
  const uploadImages = async (files) => {
    const ids = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append("image", file); // backend-ийн upload.single("image")-тэй ижил нэр
      const res = await axios.post(`${API_URL}/upload`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      ids.push(res.data._id);
    }
    return ids;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");

    if (!org.trim() || !location.trim()) {
      setError("Байгууллагын нэр болон байршлыг бөглөнө үү.");
      return;
    }

    try {
      setSaving(true);

      // 1. Шинэ зургуудыг upload хийж, хуучин ID-уудтай нэгтгэнэ
      const risksPayload = await Promise.all(
        risks.map(async (risk) => {
          const uploadedIds = await uploadImages(risk.newFiles);

          return {
            name: risk.name,
            type: risk.type,
            score: Number(risk.score),
            description: risk.description,
            location: risk.location,
            level: getLevel(Number(risk.score)),
            images: [...risk.images, ...uploadedIds],
          };
        })
      );

      // 2. Үнэлгээг шинэчилнэ
      const payload = {
        organization: org.trim(),
        location: location.trim(),
        orgEmail: orgEmail.trim(),
        selectedInsurance,
        risks: risksPayload,
      };

      const response = await axios.put(
        `${API_URL}/riskAssessments/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
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
            <span className="ml-1 font-medium text-red-500">Шинэчлэх</span>
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

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Байгууллагын имэйл
                </label>
                <input
                  type="email"
                  value={orgEmail}
                  onChange={(e) => setOrgEmail(e.target.value)}
                  placeholder="Байгууллагын имэйл"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-50"
                />
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
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Бүтээгдэхүүн хайх..."
              className="mb-4 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />

            {insuranceProducts.length === 0 ? (
              <p className="text-sm text-gray-400">
                Даатгалын бүтээгдэхүүн олдсонгүй.
              </p>
            ) : (
              <div className="grid max-h-80 gap-3 overflow-auto sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredData.map((product) => (
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
            </div>

            {risks.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-300 py-10 text-center text-sm text-gray-400">
                Эрсдэлийн мэдээлэл алга. Эрсдэл нэмэх товчийг дарна уу.
              </div>
            )}

            <div className="space-y-5">
              {risks.map((risk, index) => (
                <div
                  key={risk._key}
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
                        onChange={(e) =>
                          updateRisk(index, "type", e.target.value)
                        }
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
                              : Math.min(
                                  100,
                                  Math.max(0, Number(e.target.value))
                                )
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

                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-sm font-medium text-gray-600">
                        Тайлбар
                      </label>
                      <textarea
                        rows={3}
                        value={risk.description}
                        onChange={(e) =>
                          updateRisk(index, "description", e.target.value)
                        }
                        placeholder="Эрсдэлийн тайлбар"
                        className="w-full rounded-lg border border-gray-200 px-3 py-3 outline-none focus:border-red-400"
                      />
                    </div>

                    {/* Зураг */}
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-sm font-medium text-gray-600">
                        Эрсдэлийн зураг{" "}
                        <span className="text-xs font-normal text-gray-400">
                          (нэг зураг дээд тал нь 5MB)
                        </span>
                      </label>

                      {(risk.images.length > 0 || risk.newFiles.length > 0) && (
                        <div className="mb-3 flex flex-wrap gap-3">
                          {risk.images.map((imageId) => (
                            <ExistingImage
                              key={imageId}
                              image={imageId}
                              onRemove={() =>
                                removeExistingImage(index, imageId)
                              }
                            />
                          ))}

                          {risk.newFiles.map((file, fileIndex) => (
                            <NewImagePreview
                              key={`${file.name}-${file.lastModified}-${fileIndex}`}
                              file={file}
                              onRemove={() => removeNewFile(index, fileIndex)}
                            />
                          ))}
                        </div>
                      )}

                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600">
                        <ImagePlus size={18} />
                        Зураг нэмэх
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            addNewFiles(index, e.target.files);
                            e.target.value = ""; // ижил файлыг дахин сонгох боломжтой болгоно
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={addRisk}
                  className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                >
                  <Plus size={18} />
                  Эрсдэл нэмэх
                </button>
              </div>
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