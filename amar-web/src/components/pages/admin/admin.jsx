
import React from "react";
import { useNavigate } from "react-router-dom";
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

  // Жишээ өгөгдөл. Дараа нь API-аас авна.
  const stats = [
    {
      title: "Нийт даатгал",
      value: "24",
      description: "Бүртгэлтэй бүтээгдэхүүн",
      icon: ShieldCheck,
      color: "red",
      path: "/admin/insurances",
    },
    {
      title: "Эрсдэлийн үнэлгээ",
      value: "156",
      description: "Нийт бүртгэгдсэн үнэлгээ",
      icon: ClipboardCheck,
      color: "blue",
      path: "/admin/all-risk-assessment",
    },
    // {
    //   title: "Байгууллага",
    //   value: "38",
    //   description: "Үнэлгээ хийлгэсэн байгууллага",
    //   icon: Building2,
    //   color: "violet",
    //   path: "/admin/add-risk",
    // },
    // {
    //   title: "Өндөр эрсдэл",
    //   value: "12",
    //   description: "Анхаарал шаардлагатай",
    //   icon: AlertTriangle,
    //   color: "orange",
    //   path: "/admin/add-risk",
    // },
  ];

  const riskData = [
    { name: "Гал түймэр", score: 69, icon: Flame, color: "#DC2626" },
    { name: "Цахилгаан", score: 54, icon: Zap, color: "#EA580C" },
    { name: "Сантехник", score: 32, icon: Droplets, color: "#CA8A04" },
    { name: "Газар хөдлөлт", score: 24, icon: Activity, color: "#059669" },
    { name: "Хулгай", score: 18, icon: ShieldCheck, color: "#059669" },
  ];

  const recentInsurances = [
    {
      id: 1,
      name: "Хөрөнгийн иж бүрэн даатгал",
      category: "Эд хөрөнгө",
      services: 3,
      color: "bg-red-50 text-red-600",
    },
    {
      id: 2,
      name: "Гал түймрийн даатгал",
      category: "Эд хөрөнгө",
      services: 2,
      color: "bg-orange-50 text-orange-600",
    },
    {
      id: 3,
      name: "Тээврийн хэрэгслийн даатгал",
      category: "Тээвэр",
      services: 4,
      color: "bg-blue-50 text-blue-600",
    },
    {
      id: 4,
      name: "Гэнэтийн ослын даатгал",
      category: "Хариуцлага",
      services: 2,
      color: "bg-violet-50 text-violet-600",
    },
  ];

  const recentAssessments = [
    {
      id: 1,
      organization: "Баатарван амралт сувилал",
      type: "Гал түймэр",
      score: 69,
    },
    {
      id: 2,
      organization: "Улаанбаатар үйлчилгээ",
      type: "Цахилгаан",
      score: 54,
    },
    {
      id: 3,
      organization: "Талын төв ХХК",
      type: "Сантехник",
      score: 32,
    },
  ];

  const getLevel = (score) => {
    if (score <= 30) return "Бага";
    if (score <= 40) return "Дунд";
    if (score <= 60) return "Их";
    return "Маш их";
  };

  const getLevelStyle = (score) => {
    if (score <= 30) return "bg-emerald-50 text-emerald-700";
    if (score <= 40) return "bg-yellow-50 text-yellow-700";
    if (score <= 60) return "bg-orange-50 text-orange-700";
    return "bg-red-50 text-red-700";
  };

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
      <main className="mx-auto max-w-[1600px] space-y-7 p-4 sm:p-6 lg:p-8">
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
              Сайн байна уу, Админ аа!
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
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-bold text-gray-900">
                  Эрсдэлийн түвшний тойм
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Төрөл тус бүрийн эрсдэлийн оноо
                </p>
              </div>

              <div className="rounded-xl bg-red-50 p-2.5 text-red-600">
                <Activity size={20} />
              </div>
            </div>

            <div className="mt-7 space-y-6">
              {riskData.map((risk) => {
                const Icon = risk.icon;

                return (
                  <div key={risk.name}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <Icon
                          size={17}
                          style={{ color: risk.color }}
                          className="shrink-0"
                        />
                        <span className="truncate text-sm font-medium text-gray-700">
                          {risk.name}
                        </span>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <span
                          className={`rounded-md px-2 py-1 text-[11px] font-bold ${getLevelStyle(
                            risk.score
                          )}`}
                        >
                          {getLevel(risk.score)}
                        </span>
                        <span className="w-9 text-right text-sm font-bold text-gray-900">
                          {risk.score}
                        </span>
                      </div>
                    </div>

                    <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${risk.score}%`,
                          backgroundColor: risk.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 border-t border-gray-100 pt-5">
              {[
                ["Бага", "bg-emerald-500"],
                ["Дунд", "bg-yellow-500"],
                ["Их", "bg-orange-500"],
                ["Маш их", "bg-red-600"],
              ].map(([label, color]) => (
                <div
                  key={label}
                  className="flex items-center gap-2 text-xs text-gray-500"
                >
                  <span className={`h-2 w-2 rounded-full ${color}`} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="font-bold text-gray-900">Шуурхай үйлдэл</h2>
            <p className="mt-1 text-sm text-gray-500">
              Түгээмэл ашиглах цэсүүд
            </p>

            <div className="mt-6 space-y-3">
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

            <div className="mt-5 rounded-xl bg-gray-50 p-4">
              <div className="flex items-center gap-2 text-gray-500">
                <Clock size={16} />
                <span className="text-xs font-semibold">
                  Админы санамж
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-gray-500">
                Өндөр эрсдэлтэй байгууллагын үнэлгээг тогтмол шалгаж,
                тохирох даатгалын бүтээгдэхүүн санал болгоорой.
              </p>
            </div>
          </div>
        </section>

        {/* RECENT DATA */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* RECENT INSURANCES */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 p-5 sm:p-6">
              <div>
                <h2 className="font-bold text-gray-900">
                  Даатгалын бүтээгдэхүүнүүд
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Жишээ жагсаалт
                </p>
              </div>

              <button
                onClick={() => navigate("/admin/insurances")}
                className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700"
              >
                Бүгдийг харах
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {recentInsurances.map((insurance) => (
                <div
                  key={insurance.id}
                  className="flex items-center gap-3 px-5 py-4 transition hover:bg-gray-50 sm:px-6"
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${insurance.color}`}
                  >
                    <ShieldCheck size={21} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-800">
                      {insurance.name}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {insurance.category} · {insurance.services} нэмэлт үйлчилгээ
                    </p>
                  </div>

                  <FileText size={17} className="shrink-0 text-gray-300" />
                </div>
              ))}
            </div>
          </div>

          {/* RECENT ASSESSMENTS */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 p-5 sm:p-6">
              <div>
                <h2 className="font-bold text-gray-900">
                  Эрсдэлийн үнэлгээнүүд
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Жишээ жагсаалт
                </p>
              </div>

              <button
                onClick={() => navigate("/admin/add-risk")}
                className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700"
              >
                Үнэлгээ нэмэх
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {recentAssessments.map((assessment) => (
                <div
                  key={assessment.id}
                  className="flex items-center gap-3 px-5 py-4 transition hover:bg-gray-50 sm:px-6"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                    <AlertTriangle size={21} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-800">
                      {assessment.organization}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {assessment.type}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-extrabold text-gray-900">
                      {assessment.score}
                    </p>
                    <span
                      className={`text-[11px] font-bold ${getLevelStyle(
                        assessment.score
                      )} rounded-md px-2 py-1`}
                    >
                      {getLevel(assessment.score)}
                    </span>
                  </div>
                </div>
              ))}
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
