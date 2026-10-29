
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ShieldCheck,
  Plus,
  Trash2,
  Save,
  FileText,
  ListChecks,
  Target,
  CheckCircle2,
  ChevronDown,
  X,
  Sparkles,
  LoaderCircle,
  ArrowLeft,
} from "lucide-react";

const categories = [
  "Эд хөрөнгө",
  "Хариуцлага",
  "Амь нас, эрүүл мэнд",
  "Ачаа тээвэр",
  "Бусад",
];

const emptyProduct = {
  name: "",
  description: "",
  category: "Эд хөрөнгө",
  additionalServices: [],
  coverage: [],
};

const AddInsurance = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [product, setProduct] = useState(emptyProduct);
  const [originalProduct, setOriginalProduct] = useState(emptyProduct);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  // Бүтээгдэхүүний мэдээлэл татах
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        // Backend дээрх GET route-тай тааруулна.
        const response = await axios.get(
          `${API_URL}/products/${id}`
        );

        const data =
          response.data?.product ??
          response.data?.insuranceProduct ??
          response.data;

        if (!data || typeof data !== "object" || Array.isArray(data)) {
          throw new Error("Бүтээгдэхүүний өгөгдөл буруу байна.");
        }

        const normalizedProduct = {
          ...data,
          name: data.name ?? "",
          description: data.description ?? "",
          category: data.category ?? "Эд хөрөнгө",
          additionalServices: Array.isArray(data.additionalServices)
            ? data.additionalServices
            : [],
          coverage: Array.isArray(data.coverage)
            ? data.coverage
            : [],
        };

        setProduct(normalizedProduct);
        setOriginalProduct(normalizedProduct);
      } catch (err) {
        console.error("Бүтээгдэхүүн татахад алдаа:", err);
        setError(
          err.response?.data?.message ||
            "Даатгалын мэдээлэл татаж чадсангүй."
        );
      } finally {
        setLoading(false);
      }
    };

    if (!API_URL || !id) {
      setError("API URL эсвэл бүтээгдэхүүний ID олдсонгүй.");
      setLoading(false);
      return;
    }

    fetchProduct();
  }, [API_URL, id]);

  // Үндсэн талбар өөрчлөх
  const updateField = (field, value) => {
    setProduct((prev) => ({
      ...prev,
      [field]: value,
    }));

    setError("");
    setSaved(false);
  };

  // Массивын нэг мөр өөрчлөх
  const updateArrayItem = (field, index, value) => {
    setProduct((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) =>
        i === index ? value : item
      ),
    }));

    setError("");
    setSaved(false);
  };

  // Шинэ мөр нэмэх
  const addArrayItem = (field) => {
    setProduct((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));

    setSaved(false);
  };

  // Мөр устгах
  const removeArrayItem = (field, index) => {
    setProduct((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));

    setSaved(false);
  };

  // Анхны мэдээллийг сэргээх
  const resetForm = () => {
    setProduct({ ...originalProduct });
    setError("");
    setSaved(false);
  };

  // Өөрчлөлтийг database-д хадгалах
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaved(false);

    if (!product.name.trim() || !product.description.trim()) {
      setError(
        "Даатгалын нэр болон тайлбарыг заавал бөглөнө үү."
      );
      return;
    }

    if (!id) {
      setError("Засах бүтээгдэхүүний ID олдсонгүй.");
      return;
    }

    const payload = {
      name: product.name.trim(),
      description: product.description.trim(),
      category: product.category,
      additionalServices: product.additionalServices
        .map((item) => item.trim())
        .filter(Boolean),
      coverage: product.coverage
        .map((item) => item.trim())
        .filter(Boolean),
    };

    try {
      setSaving(true);

      // PUT нь одоо байгаа бүтээгдэхүүнийг шинэчилнэ.
      const response = await axios.put(
        `${API_URL}/insurance-products/${id}`,
        payload
      );

      const responseData =
        response.data?.product ??
        response.data?.insuranceProduct ??
        response.data;

      const updatedProduct =
        responseData &&
        typeof responseData === "object" &&
        !Array.isArray(responseData) &&
        responseData.name
          ? {
              ...product,
              ...responseData,
              ...payload,
            }
          : {
              ...product,
              ...payload,
            };

      setProduct(updatedProduct);
      setOriginalProduct(updatedProduct);
      setSaved(true);
      navigate("/admin/products");
    } catch (err) {
      console.error("Хадгалахад алдаа:", err);
      setError(
        err.response?.data?.message ||
          "Мэдээлэл хадгалахад алдаа гарлаа."
      );
    } finally {
      setSaving(false);
    }
  };

  // Loading дэлгэц
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <LoaderCircle
          size={38}
          className="mb-4 animate-spin text-red-600"
        />
        <p className="text-sm text-gray-500">
          Даатгалын мэдээлэл ачаалж байна...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full min-w-0 space-y-7 p-4 sm:p-6 md:px-8 lg:p-10 lg:pl-85 lg:pr-20">
        {/* HEADER */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-5 inline-flex items-center gap-2 rounded-lg text-sm font-medium text-gray-500 transition hover:text-red-600"
          >
            <ArrowLeft size={17} />
            Буцах
          </button>

          <div className="mb-3 flex items-center gap-2 text-sm text-gray-400">
            <ShieldCheck size={16} />
            <span>Админ</span>
            <span>/</span>
            <span>Даатгал</span>
            <span>/</span>
            <span className="font-medium text-red-600">
              Даатгал засах
            </span>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                Даатгал засах
              </h1>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Даатгалын нэр, тайлбар, хамрах хүрээ болон нэмэлт
                үйлчилгээг шинэчилнэ.
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <ShieldCheck size={30} />
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* BASIC INFORMATION */}
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-5 sm:px-7">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <FileText size={21} />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">
                  Үндсэн мэдээлэл
                </h2>
                <p className="mt-1 text-xs text-gray-400">
                  Даатгалын нэр, тайлбар, ангилал
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-7">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Даатгалын нэр <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={product.name}
                  onChange={(e) =>
                    updateField("name", e.target.value)
                  }
                  placeholder="Жишээ: Хөрөнгийн иж бүрэн даатгал"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-50"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Даатгалын тайлбар{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={product.description}
                  onChange={(e) =>
                    updateField("description", e.target.value)
                  }
                  placeholder="Даатгалын зорилго, ямар эрсдэлээс хамгаалах талаар дэлгэрэнгүй бичнэ үү..."
                  required
                  className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-gray-400 focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-50"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Даатгалын ангилал{" "}
                  <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <select
                    value={product.category}
                    onChange={(e) =>
                      updateField("category", e.target.value)
                    }
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm outline-none transition focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-50"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={18}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ADDITIONAL SERVICES */}
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Sparkles size={21} />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">
                    Нэмэлт үйлчилгээ
                  </h2>
                  <p className="mt-1 text-xs text-gray-400">
                    Даатгалтай хамт санал болгох нэмэлт үйлчилгээнүүд
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 p-5 sm:p-7">
              {product.additionalServices.map((service, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
                    <span className="text-sm font-bold">
                      {index + 1}
                    </span>
                  </div>

                  <input
                    type="text"
                    value={service}
                    onChange={(e) =>
                      updateArrayItem(
                        "additionalServices",
                        index,
                        e.target.value
                      )
                    }
                    placeholder="Жишээ: Галын эрсдэлийн үнэлгээ"
                    className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-50"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removeArrayItem("additionalServices", index)
                    }
                    aria-label="Үйлчилгээ устгах"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}

              {product.additionalServices.length === 0 && (
                <p className="rounded-xl bg-gray-50 px-4 py-5 text-center text-sm text-gray-400">
                  Нэмэлт үйлчилгээ бүртгээгүй байна.
                </p>
              )}


              <div className="mt-6 flex justify-end">
                <button
                type="button"
                onClick={() => addArrayItem("additionalServices")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <Plus size={17} />
                  Үйлчилгээ нэмэх
                </button>
              </div>
            </div>
          </section>

          {/* COVERAGE */}
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Target size={21} />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">
                    Даатгалын хамрах хүрээ
                  </h2>
                  <p className="mt-1 text-xs text-gray-400">
                    Даатгалд хамрагдах эрсдэл, хөрөнгө болон нөхцөлүүд
                  </p>
                </div>
              </div>

              
            </div>

            <div className="space-y-3 p-5 sm:p-7">
              {product.coverage.map((coverage, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
                    <ListChecks size={19} />
                  </div>

                  <input
                    type="text"
                    value={coverage}
                    onChange={(e) =>
                      updateArrayItem(
                        "coverage",
                        index,
                        e.target.value
                      )
                    }
                    placeholder="Жишээ: Гал түймрийн улмаас учирсан хохирол"
                    className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-50"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removeArrayItem("coverage", index)
                    }
                    aria-label="Хамрах хүрээ устгах"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}

              {product.coverage.length === 0 && (
                <p className="rounded-xl bg-gray-50 px-4 py-5 text-center text-sm text-gray-400">
                  Хамрах хүрээ бүртгээгүй байна.
                </p>
              )}

              <div className="mt-6 flex justify-end">
                <button
                type="button"
                onClick={() => addArrayItem("coverage")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <Plus size={17} />
                  Хүрээ нэмэх
                </button>
              </div>
            </div>
          </section>

          {/* SUCCESS MESSAGE */}
          {saved && (
            <div
              role="status"
              className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
            >
              <CheckCircle2 size={20} className="shrink-0" />
              <div>
                <p className="font-bold">
                  Амжилттай хадгалагдлаа.
                </p>
                <p className="mt-1">
                  Даатгалын бүтээгдэхүүний мэдээлэл шинэчлэгдлээ.
                </p>
              </div>
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={resetForm}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
            >
              <X size={17} />
              Өөрчлөлтийг буцаах
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-red-200 transition hover:-translate-y-0.5 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {saving ? "Хадгалж байна..." : "Даатгал хадгалах"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInsurance;
