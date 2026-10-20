
import {React, useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  ShieldCheck,
  ClipboardCheck,
  Building2,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  Flame,
  Zap,
  Droplets,
  Activity,
  ChevronRight,
  FileText,
  Clock,
  Eye,
  TrendingUp,
} from "lucide-react";

const AdminHome = () => {
  const navigate = useNavigate();
  const [riskAssessments, setRiskAssessments] = useState([]);
  const [insurances, setInsurances] =   useState([]);

  const API_URL = import.meta.env.VITE_API_URL;
  const user = jwtDecode(localStorage.getItem("token"));


  useEffect(() => {
    const fetchRiskAssessments = async () => {
      try{
        const response = await axios.get(`${API_URL}/risk-assessments`,{
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setRiskAssessments(response.data);
      } catch (error) {
        console.error("Error fetching risk assessments:", error);
      }
    };

    const fetchInsurances = async () => {
      try{

        const response = await axios.get(`${API_URL}/insurance-products`);
        setInsurances(response.data);
      } catch (error) {
        console.error("Error fetching insurances:", error);
      }
    };

    fetchRiskAssessments();
    fetchInsurances();
  }, []);

  // Жишээ өгөгдөл. Дараа нь API-аас авна.
  const stats = [
    {
      title: "Нийт даатгал",
      value: insurances.length.toString(),
      description: "Бүртгэлтэй бүтээгдэхүүн",
      icon: ShieldCheck,
      color: "red",
      path: "/admin/insurances",
    },
    {
      title: "Эрсдэлийн үнэлгээ",
      value: (riskAssessments?.length ?? 0).toString(),
      description: "Нийт бүртгэгдсэн үнэлгээ",
      icon: ClipboardCheck,
      color: "blue",
      path: "/admin/all-risk-assessment",
    },
  ];

  const colorStyles = {
    red: {
      icon: "bg-red-50 text-red-600",
      hover: "hover:border-red-200",
    },
    blue: {
      icon: "bg-blue-50 text-blue-600",
      hover: "hover:border-blue-200",
    },
    violet: {
      icon: "bg-violet-50 text-violet-600",
      hover: "hover:border-violet-200",
    },
    orange: {
      icon: "bg-orange-50 text-orange-600",
      hover: "hover:border-orange-200",
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl space-y-7 p-4 sm:p-6 md:px-8 lg:p-10">
        {/* PAGE HEADER */}
        <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-medium text-gray-400">
              <Building2 size={15} />
              <span>AMAR</span>
              <ChevronRight size={13} />
              <span className="text-red-600">Хянах самбар</span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
              Сайн байна уу, {user?.email?.split('@')[0] || "Админ"}
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Даатгалын системийн ерөнхий мэдээлэл болон үйл ажиллагааны тойм.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/admin/add-risk")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <ClipboardCheck size={18} />
              Үнэлгээ нэмэх
            </button>

            <button
              onClick={() => navigate("/admin/add-insurance")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-red-200 transition hover:-translate-y-0.5 hover:bg-red-700"
            >
              <Plus size={19} />
              Даатгал нэмэх
            </button>
          </div>
        </header>

        {/* WELCOME BANNER */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-700 via-red-600 to-rose-500 p-6 text-white shadow-lg shadow-red-100 sm:p-8">
          <div className="relative z-10 max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium">
              <Activity size={15} />
              Системийн удирдлага
            </div>

            <h2 className="text-2xl font-bold leading-tight sm:text-3xl">
              Эрсдэлийг удирдаж,
              <br className="hidden sm:block" /> хамгааллыг нэмэгдүүлье.
            </h2>

            <p className="mt-3 max-w-lg text-sm leading-6 text-red-50">
              Байгууллагын эрсдэлийг үнэлж, тохирох даатгалын бүтээгдэхүүн
              болон нэмэлт үйлчилгээг нэг дороос удирдаарай.
            </p>

            <button
              onClick={() => navigate("/admin/add-risk")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-red-700 transition hover:bg-red-50"
            >
              Үнэлгээ бүртгэх
              <ArrowUpRight size={17} />
            </button>
          </div>

          <div className="pointer-events-none absolute -right-8 -top-20 hidden h-80 w-80 items-center justify-center rounded-full border border-white/10 sm:flex">
            <div className="flex h-60 w-60 items-center justify-center rounded-full border border-white/15">
              <div className="flex h-40 w-40 items-center justify-center rounded-full bg-white/10">
                <ShieldCheck size={85} strokeWidth={1.2} />
              </div>
            </div>
          </div>
        </section>

        {/* STAT CARDS */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Системийн үзүүлэлтүүд
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Нийт бүртгэл болон эрсдэлийн мэдээлэл
              </p>
            </div>
            <TrendingUp size={20} className="text-gray-400" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-2">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <button
                  key={stat.title}
                  onClick={() => navigate(stat.path)}
                  className={`group rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md ${colorStyles[stat.color].hover}`}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${colorStyles[stat.color].icon}`}
                    >
                      <Icon size={23} />
                    </div>

                    <ArrowUpRight
                      size={18}
                      className="text-gray-300 transition group-hover:text-red-500"
                    />
                  </div>

                  <p className="mt-5 text-sm font-medium text-gray-500">
                    {stat.title}
                  </p>

                  <p className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900">
                    {stat.value}
                  </p>

                  <p className="mt-2 text-xs text-gray-400">
                    {stat.description}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* RISK CHART + QUICK ACTIONS */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* RISK OVERVIEW */}
          {/* <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
            <div className="flex items-start justify-between gap-3">
                
              
            </div>
          </div> */}

          {/* QUICK ACTIONS */}
          <div className="rounded-2xl border border-gray-200 bg-white w-2xl p-5 shadow-sm sm:p-6">
            <h2 className="font-bold text-gray-900">Шуурхай үйлдэл</h2>
            <p className="mt-1 text-sm text-gray-500">
              Түгээмэл ашиглах цэсүүд
            </p>

            <div className="gap-4 mt-6 space-y-3">
              <button
                onClick={() => navigate("/admin/add-insurance")}
                className="group flex w-full items-center gap-3 rounded-xl border border-gray-100 p-4 text-left transition hover:border-red-200 hover:bg-red-50/60"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <Plus size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-gray-800">
                    Даатгал нэмэх
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Шинэ бүтээгдэхүүн бүртгэх
                  </p>
                </div>
                <ChevronRight
                  size={18}
                  className="text-gray-300 transition group-hover:text-red-600"
                />
              </button>

              <button
                onClick={() => navigate("/admin/add-risk")}
                className="group flex w-full items-center gap-3 rounded-xl border border-gray-100 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50/60"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <ClipboardCheck size={21} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-gray-800">
                    Эрсдэлийн үнэлгээ нэмэх
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Шинэ үнэлгээ бүртгэх
                  </p>
                </div>
                <ChevronRight
                  size={18}
                  className="text-gray-300 transition group-hover:text-blue-600"
                />
              </button>

              <button
                onClick={() => navigate("/admin/insurances")}
                className="group flex w-full items-center gap-3 rounded-xl border border-gray-100 p-4 text-left transition hover:border-violet-200 hover:bg-violet-50/60"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <Eye size={21} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-gray-800">
                    Даатгалын жагсаалт
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Бүртгэлтэй даатгалуудыг харах
                  </p>
                </div>
                <ChevronRight
                  size={18}
                  className="text-gray-300 transition group-hover:text-violet-600"
                />
              </button>
              
            </div>
          </div>
        </section>


        {/* FOOTER */}
        <footer className="flex flex-col gap-2 border-t border-gray-200 pt-5 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between">
          <p>AMAR · Даатгалын удирдлагын систем</p>
          <p>Админ хянах самбар</p>
        </footer>
      </main>
    </div>
  );
};

export default AdminHome;
