import React, { useState, useEffect } from "react";
import axios from "axios";
import {jwtDecode} from "jwt-decode";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Save,
  ClipboardList,
  Activity,  
  CheckCircle2, Wallet, Percent, ShoppingBag
} from "lucide-react";


import { ShieldCheck, Check } from "lucide-react";

const AddRisk = () => {
  const [organization, setOrganization] = useState("");
  const [orgLocation, setOrgLocation] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [insurance, setInsurance] = useState([]);
  const [selectedInsurance, setSelectedInsurance] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [orgEmail, setOrgEmail] = useState("");
  const [valuation, setValuation] = useState({});
  const [insuranceRates, setInsuranceRates] = useState({});
  const [quantity, setQuantity] = useState({});

  const formatNumber = (v) => {
    const digits = String(v).replace(/\D/g, ""); 
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };


  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const user = jwtDecode(token);
  const id = user?.id
  
  useEffect(() => {
    const fetchInsurance = async () => {
      try{
        const response = await axios.get(`${API_URL}/insurance-products`);
        setInsurance(response.data);
      } catch (error) {
        console.error("Error fetching insurance data:", error);
      }
    }
    fetchInsurance();
  }, []);

  const filteredInsurance = insurance.filter((item) => {
    const query = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      (item.category && item.category.toLowerCase().includes(query))
    );
  });

  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!organization.trim()) {
      setError("Байгууллагын нэрээ оруулна уу.");
      return;
    }

    const payload = {
      organization: organization.trim(),
      address: orgLocation.trim(),
      email: orgEmail.trim(),
      priceOffers: selectedInsurance.map((insurance) => ({
        insuranceId: insurance,
        valuation: valuation[insurance] || 0,
        quantity: quantity[insurance] || 1,
        feePercentage: insuranceRates[insurance] || 0,
          feeAmount: (valuation[insurance] * (quantity[insurance] || 1) || 0) * (insuranceRates[insurance] || 0) / 100,
        })),
      user: id,
    };


    setLoading(true);
    try{
      await axios.post(`${API_URL}/price-offers`, payload);
      navigate(0);

      setSaved(true);
      setError("");
    }
    catch (err) {
      setError(err.response?.data?.message || (err.code === "ERR_NETWORK" ? "Сервертэй холбогдож чадсангүй." : "Алдаа гарлаа."));
    }
    finally{
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
              <span className="text-red-600">Даатгалын үнийн санал</span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
              Даатгалын үнийн санал нэмэх
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Байгууллагад тохирох даатгалын үнийн санал нэмэх хэсэг. Та байгууллагын нэр, байршил болон даатгалын бүтээгдэхүүнүүдийг сонгож, эрсдэлийн үнэлгээг оруулна уу.
            </p>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Сонгосон даатгал</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {selectedInsurance.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Нийт хураамж</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {formatNumber(
                  selectedInsurance.reduce((total, insuranceId) => {
                    const val = Number(valuation[insuranceId]) || 0;
                    const qty = Number(quantity[insuranceId]) || 1;
                    const rate = Number(insuranceRates[insuranceId]) || 0;

                    return total + (val * qty * rate) / 100;
                  }, 0)
                )} ₮
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Нийт даатгал</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
               {insurance.length}
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
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm mb-4 outline-none transition placeholder:text-gray-400 focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-50"
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
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-50"
            />

            <label className="mb-2 mt-4 block text-sm font-semibold text-gray-700">
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

          <div className=" border border-gray-200 bg-white rounded-2xl mt-6">
                      
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between border-b border-gray-100 bg-linear-to-r  from-gray-50/80 to-white px-5 py-4 sm:px-7">
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

            {/* Product list */}
            {insurance.length > 0 ? (
              <ul className="divide-y divide-gray-100 overflow-y-auto max-h-120">
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
                        isSelected ? "bg-red-50/40" : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      <button
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => {
                          setSelectedInsurance((prev) =>
                            prev.includes(item._id)
                              ? prev.filter((id) => id !== item._id)
                              : [...prev, item._id]
                          );
                        }}
                        className="flex w-full items-center gap-4 px-5 py-4 text-left sm:px-7"
                      >
                        {/* Icon */}
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

                        {/* Product information */}
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

                        {/* Animated selection control */}
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
                     {isSelected && (
                        <div className="border-t border-red-100 bg-linear-to-b from-red-50 to-white px-5 py-5 sm:px-7 sm:py-6">

                          <div className="mx-auto max-w-4xl space-y-5">

                            {/* Header */}
                            <div className="flex  items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                                <Wallet size={20} />
                              </div>

                              <div>
                                <h3 className="text-sm font-bold text-gray-800 sm:text-base">
                                  Даатгалын нөхцөл
                                </h3>
                                <p className="text-xs text-gray-400">
                                  Хөрөнгийн үнэлгээ болон хураамжийн мэдээлэл
                                </p>
                              </div>
                            </div>

                            {/* Inputs */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid:cols-2 lg:grid-cols-4">

                              {/* Үнэлгээ */}
                              <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                                  Хөрөнгийн нийт үнэлгээ
                                  <span className="text-red-500">*</span>
                                </label>

                                <div className="flex items-center rounded-xl border border-gray-200 bg-white px-3 transition-all duration-200 focus-within:border-red-400 focus-within:ring-4 focus-within:ring-red-500/10">

                                  <Wallet size={18} className="shrink-0 text-gray-400" />

                                  <input
                                    type="text"
                                    value={formatNumber(valuation[item._id] || "")}
                                    onChange={(e) => {setValuation((prev) => ({ ...prev, [item._id]: e.target.value.replace(/\D/g, "") })); setSaved(false); setError("");}}
                                    placeholder="100000000"
                                    className="w-full min-w-0 bg-transparent px-3 py-3 text-sm font-medium text-gray-800 outline-none placeholder:font-normal placeholder:text-gray-300"
                                  />

                                  <span className="text-sm font-bold text-gray-400">
                                    ₮
                                  </span>
                                </div>
                              </div>

                              {/* Тоо хэмжээ */}

                              {/* Хураамж */}
                              <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                                  Тоо хэмжээ
                                  <span className="text-red-500">*</span>
                                </label>

                                <div className="flex items-center rounded-xl border border-gray-200 bg-white px-3 transition-all duration-200 focus-within:border-red-400 focus-within:ring-4 focus-within:ring-red-500/10">

                                  <ShoppingBag size={18} className="shrink-0 text-gray-400" />

                                  <input
                                    type="number"
                                    min="1"
                                    value={quantity[item._id] || ""}
                                    onChange={(e) => {setQuantity((prev) => ({ ...prev, [item._id]: e.target.value })); setSaved(false); setError("");}}
                                    placeholder="1"
                                    className="w-full min-w-0 bg-transparent px-3 py-3 text-sm font-medium text-gray-800 outline-none placeholder:font-normal placeholder:text-gray-300"
                                  />
                                </div>
                              </div>

                              {/* Хураамж */}
                              <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                                  Хураамжийн хувь
                                  <span className="text-red-500">*</span>
                                </label>

                                <div className="flex items-center rounded-xl border border-gray-200 bg-white px-3 transition-all duration-200 focus-within:border-red-400 focus-within:ring-4 focus-within:ring-red-500/10">

                                  <Percent size={18} className="shrink-0 text-gray-400" />

                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={insuranceRates[item._id] || ""}
                                    onChange={(e) => {setInsuranceRates((prev) => ({ ...prev, [item._id]: e.target.value })); setSaved(false); setError("");}}
                                    placeholder="1.5"
                                    className="w-full min-w-0 bg-transparent px-3 py-3 text-sm font-medium text-gray-800 outline-none placeholder:font-normal placeholder:text-gray-300"
                                  />

                                  <span className="text-sm font-bold text-gray-400">
                                    %
                                  </span>
                                </div>
                              </div>
                              {/* Хураамжийн дүн */}
                              <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                                  Хураамжийн дүн
                                </label>

                                <div className="flex items-center rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-medium text-gray-800 mt-2">
                                  {formatNumber((valuation[item._id] * (quantity[item._id] || 1)) / 100 * insuranceRates[item._id]) || 0} ₮
                                </div>
                              </div>

                            </div>

                          </div>
                        </div>
                      )}
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

            {/* Selection footer */}
            {insurance.length > 0 && (
              <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/70 px-5 py-3.5 sm:px-7">
                <p className="text-xs text-gray-500">
                  Сонгосон бүтээгдэхүүн
                </p>

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
                  Эрсдэлийн үнэлгээ амжилттай нэмэгдлээ!
                </p>
              </div>
            </div>
          )}

          {/* FOOTER ACTIONS */}
          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-gray-400">
              Нийт {selectedInsurance.length} даатгалын бүтээгдэхүүн сонгогдсон.
              <br />
              * тэмдэгтэй талбаруудыг заавал бөглөнө.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-200 transition hover:-translate-y-0.5 hover:bg-red-700"
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
