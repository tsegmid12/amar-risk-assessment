import React, { useState } from "react";
import axios from "axios";
import {
  ShieldCheck,
  Plus,
  Trash2,
  Save,
  FileText,
  Layers,
  ListChecks,
  Target,
  CheckCircle2,
  ChevronDown,
  X,
  Sparkles,
} from "lucide-react";

const categories = [
  "Эд хөрөнгө",
  "Хариуцлага",
  "Амь нас, эрүүл мэнд",
  "Ачаа тээвэр",
  "Бусад",
];



const AddInsurance = () => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "Эд хөрөнгө",
  });

  const [services, setServices] = useState([""]);
  const [coverages, setCoverages] = useState([""]);
  
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
    setSaved(false);
  };

  const updateList = (setter, list, index, value) => {
    setter(list.map((item, i) => (i === index ? value : item)));
    setError("");
    setSaved(false);
  };

  const addItem = (setter, list) => {
    setter([...list, ""]);
    setSaved(false);
  };

  const removeItem = (setter, list, index) => {
    setter(list.filter((_, i) => i !== index));
    setSaved(false);
  };

    const API_URL = import.meta.env.VITE_API_URL;


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.description.trim()) {
      setError("Даатгалын нэр болон тайлбарыг заавал бөглөнө үү.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      additionalServices: services
        .map((item) => item.trim())
        .filter(Boolean),
      coverage: coverages
        .map((item) => item.trim())
        .filter(Boolean),
    };

    // Одоогоор зөвхөн frontend шалгалт хийнэ.
    await axios.post(`${API_URL}/insurance-products`, payload)
    // Backend API холбохдоо энд POST хүсэлт нэмнэ.

    setSaved(true);
    setError("");
  };


  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      category: "Эд хөрөнгө",
    });
    setServices([""]);
    setCoverages([""]);
    setError("");
    setSaved(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        {/* HEADER */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-sm text-gray-400">
            <ShieldCheck size={16} />
            <span>Админ</span>
            <span>/</span>
            <span>Даатгал</span>
            <span>/</span>
            <span className="font-medium text-red-600">
              Даатгал нэмэх
            </span>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                Даатгал нэмэх
              </h1>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Шинэ даатгалын бүтээгдэхүүн, хамрах хүрээ болон
                нэмэлт үйлчилгээг бүртгэнэ.
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <ShieldCheck size={30} />
            </div>
          </div>
        </div>

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
                  value={form.name}
                  onChange={(e) => {updateForm("name", e.target.value); setName(e.target.value)}}
                  placeholder="Жишээ: Хөрөнгийн иж бүрэн даатгал"
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
                  value={form.description}
                  onChange={(e) =>
                    {updateForm("description", e.target.value);
                      setDescription(e.target.value)
                    }
                  }
                  placeholder="Даатгалын зорилго, ямар эрсдэлээс хамгаалах талаар дэлгэрэнгүй бичнэ үү..."
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
                    value={form.category}
                    onChange={(e) =>
                      {updateForm("category", e.target.value);
                        setCategory(e.target.value)
                      }
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

              <button
                type="button"
                onClick={() => addItem(setServices, services)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <Plus size={17} />
                Үйлчилгээ нэмэх
              </button>
            </div>

            <div className="space-y-3 p-5 sm:p-7">
              {services.map((service, index) => (
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
                      {updateList(setServices, services, index, e.target.value);
                        setAdditionalServices(services)
                      }
                    }
                    placeholder="Жишээ: Галын эрсдэлийн үнэлгээ"
                    className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-50"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removeItem(setServices, services, index)
                    }
                    aria-label="Үйлчилгээ устгах"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}

              {services.length === 0 && (
                <p className="rounded-xl bg-gray-50 px-4 py-5 text-center text-sm text-gray-400">
                  Нэмэлт үйлчилгээ бүртгээгүй байна.
                </p>
              )}
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

              <button
                type="button"
                onClick={() => addItem(setCoverages, coverages)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <Plus size={17} />
                Хүрээ нэмэх
              </button>
            </div>

            <div className="space-y-3 p-5 sm:p-7">
              {coverages.map((coverage, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
                    <ListChecks size={19} />
                  </div>

                  <input
                    type="text"
                    value={coverage}
                    onChange={(e) =>
                      {updateList(setCoverages, coverages, index, e.target.value);
                      }
                    }
                    placeholder="Жишээ: Гал түймрийн улмаас учирсан хохирол"
                    className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-50"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      {removeItem(setCoverages, coverages, index);
                      }
                    }
                    aria-label="Хамрах хүрээ устгах"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}

              {coverages.length === 0 && (
                <p className="rounded-xl bg-gray-50 px-4 py-5 text-center text-sm text-gray-400">
                  Хамрах хүрээ бүртгээгүй байна.
                </p>
              )}
            </div>
          </section>

          {/* STATUS MESSAGES */}
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {saved && (
            <div
              role="status"
              className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
            >
              <CheckCircle2 size={20} className="shrink-0" />
              <div>
                <p className="font-bold">
                  Мэдээлэл амжилттай хадгалагдлаа.
                </p>
                <p className="mt-1">
                  Мэдээлэл амжилттай хадгалагдлаа.
                </p>
              </div>
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
            >
              <X size={17} />
              Цэвэрлэх
            </button>

            <button
              type="submit"
              onClick={handleSubmit}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-red-200 transition hover:-translate-y-0.5 hover:bg-red-700"
            >
              <Save size={18} />
              Даатгал хадгалах
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInsurance;
