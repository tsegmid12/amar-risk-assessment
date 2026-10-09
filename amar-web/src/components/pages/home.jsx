import React, { useState } from "react";

import page from "../../assets/page.png";
import offer from "../../assets/offer.png";
import flame from "../../assets/flame.png";
import shield from "../../assets/shield.png";
import warning from "../../assets/warning.png";
import risk from "../../assets/risk.png";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const Home = () => {
  // =========================
  // STATE
  // =========================

  const [active, setActive] = useState(1);

  // Аль даатгалын дэлгэрэнгүй нээгдсэнийг хадгална
  const [expanded, setExpanded] = useState(null);

  // =========================
  // RISK DATA
  // =========================

  const data = [
    {
      name: "Гал",
      value: 60,
    },
    {
      name: "Цахилгаан",
      value: 70,
    },
    {
      name: "Сан техник",
      value: 20,
    },
    {
      name: "Газар хөдлөлт",
      value: 20,
    },
    {
      name: "Хулгай",
      value: 20,
    },
  ];


  // =========================
  // INSURANCE DATA
  // =========================

  const data2 = [
    {
      id: 1,
      name: "Хөрөнгийн иж бүрэн даатгал",
      category: "Эд хөрөнгө",
      description:
        "Байгууллагын эд хөрөнгийг олон төрлийн эрсдэлээс хамгаална.",
      coverage:
        "Гал түймэр, үер, газар хөдлөлт болон бусад эрсдэлээс хамгаална.",
      benefit:
        "Барилга байгууламж, тоног төхөөрөмж, эд хөрөнгийн хохирлыг нөхөн төлнө.",
    },

    {
      id: 2,
      name: "Гал түймрийн даатгал",
      category: "Эд хөрөнгө",
      description:
        "Гал түймэртэй холбоотой эрсдэлийн хохирлыг хамгаална.",
      coverage:
        "Гал түймэр, дэлбэрэлт, утааны улмаас үүсэх хохирлыг хамруулна.",
      benefit:
        "Галын улмаас үүссэн эд хөрөнгийн хохирлыг нөхөн төлнө.",
    },

    {
      id: 3,
      name: "Газар хөдлөлтийн даатгал",
      category: "Эд хөрөнгө",
      description:
        "Газар хөдлөлтийн улмаас үүсэх хохирлыг хамгаална.",
      coverage:
        "Газар хөдлөлт болон чичиргээний улмаас үүсэх хохирлыг хамруулна.",
      benefit:
        "Барилга болон эд хөрөнгийн хохирлыг нөхөн төлнө.",
    },

    {
      id: 4,
      name: "Гэнэтийн ослын даатгал",
      category: "Хариуцлага",
      description:
        "Ажилтан болон байгууллагатай холбоотой ослын эрсдэлийг хамгаална.",
      coverage:
        "Гэнэтийн осол, гэмтэл болон хөдөлмөрийн ослын эрсдэлийг хамруулна.",
      benefit:
        "Ослын улмаас гарах эмчилгээ болон бусад зардлыг нөхөн төлнө.",
    },

    {
      id: 5,
      name: "Тээврийн хэрэгслийн даатгал",
      category: "Тээвэр",
      description:
        "Тээврийн хэрэгсэлтэй холбоотой эрсдэлийг хамгаална.",
      coverage:
        "Зам тээврийн осол, хулгай болон байгалийн гамшгийн эрсдэлийг хамруулна.",
      benefit:
        "Тээврийн хэрэгслийн засвар үйлчилгээний зардлыг нөхөн төлнө.",
    },
  ];


  // =========================
  // FILTER
  // =========================

  const filteredData =
    active === 1
      ? data2
      : data2.filter((item) => {
          if (active === 2) {
            return item.category === "Эд хөрөнгө";
          }

          if (active === 3) {
            return item.category === "Хариуцлага";
          }

          if (active === 4) {
            return item.category === "Тээвэр";
          }

          return true;
        });


  // =========================
  // RETURN
  // =========================

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8">

      {/* ================================================= */}
      {/* MAIN CONTAINER */}
      {/* ================================================= */}

      <div className="mx-auto max-w-[1600px] px-6 lg:px-8">


        {/* ================================================= */}
        {/* TOP SECTION */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">


          {/* ================================================= */}
          {/* ORGANIZATION CARD */}
          {/* ================================================= */}

          <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">

            {/* TITLE */}

            <div className="flex items-start gap-4">

              <div className="h-14 w-1.5 rounded-full bg-red-500"></div>

              <div>

                <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                  Баатарван амралт сувилалт
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Танай байгууллагын эрсдэлийг хамгаалах даатгал
                </p>

              </div>

            </div>


            {/* ================================================= */}
            {/* STAT CARDS */}
            {/* ================================================= */}

            <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">


              {/* RECOMMENDATION */}

              <div className="group rounded-2xl border border-gray-300 p-5 transition duration-300 hover:-translate-y-1 hover:shadow-md">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0c6b37]">

                  <img
                    src={page}
                    alt="page"
                    className="w-7"
                  />

                </div>

                <p className="mt-5 text-4xl font-bold text-gray-900">
                  12
                </p>

                <p className="mt-1 text-sm font-medium text-gray-600">
                  Санал болгосон
                </p>

                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-gray-300 px-3 py-2">

                  <img
                    src={offer}
                    alt="offer"
                    className="w-5"
                  />

                  <span className="text-xs font-medium text-gray-500">
                    Даатгал
                  </span>

                </div>

              </div>


              {/* FIRE RISK */}

              <div className="group rounded-2xl border border-gray-300 p-5 transition duration-300 hover:-translate-y-1 hover:shadow-md">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#82000f]">

                  <img
                    src={flame}
                    alt="flame"
                    className="w-7"
                  />

                </div>

                <div className="mt-5">

                  <span className="text-4xl font-bold text-gray-900">
                    69
                  </span>

                  <span className="ml-1 text-sm font-semibold text-gray-400">
                    /100
                  </span>

                </div>

                <p className="mt-1 text-sm font-medium text-gray-600">
                  Гал түймрийн эрсдэл
                </p>

                <div className="mt-4 inline-flex items-center gap-2 border border-gray-300 rounded-full px-3 py-2">

                  <img
                    src={warning}
                    alt="warning"
                    className="w-5"
                  />

                  <span className="text-xs font-medium text-gray-500">
                    Өндөр эрсдэл
                  </span>

                </div>

              </div>


              {/* AVERAGE RISK */}

              <div className="group rounded-2xl border border-gray-300 p-5 transition duration-300 hover:-translate-y-1 hover:shadow-md">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#d00018]">

                  <img
                    src={shield}
                    alt="shield"
                    className="w-7"
                  />

                </div>

                <div className="mt-5">

                  <span className="text-4xl font-bold text-gray-900">
                    36
                  </span>

                  <span className="ml-1 text-sm font-semibold text-gray-400">
                    /100
                  </span>

                </div>

                <p className="mt-1 text-sm font-medium text-gray-600">
                  Дундаж эрсдэл
                </p>

                <div className="mt-4 inline-flex items-center gap-2 border border-gray-300 rounded-full px-3 py-2">

                  <img
                    src={risk}
                    alt="risk"
                    className="w-5"
                  />

                  <span className="text-xs font-medium text-gray-500">
                    Дундаж эрсдэл
                  </span>

                </div>

              </div>

            </div>

          </div>


          {/* ================================================= */}
          {/* RISK CHART */}
          {/* ================================================= */}

          <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">

            <div className="flex items-start justify-between">

              <div>

                <h2 className="text-3xl font-bold text-gray-900">
                  Эрсдэлийн үнэлгээ
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Байгууллагын эрсдэлийн түвшний харьцуулалт
                </p>

              </div>

              <div className="rounded-xl bg-red-50 px-4 py-2">

                <span className="text-sm font-semibold text-red-500">
                  0–100
                </span>

              </div>

            </div>


            {/* CHART */}

            <div className="mt-6 h-70 w-full">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={data}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -15,
                    bottom: 10,
                  }}
                  barCategoryGap="25%"
                >

                  <CartesianGrid
                    strokeDasharray="5 5"
                    vertical={false}
                    stroke="#E5E7EB"
                  />

                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#64748B",
                      fontSize: 12,
                    }}
                  />

                  <YAxis
                    domain={[0, 100]}
                    ticks={[
                      0,
                      20,
                      40,
                      60,
                      80,
                      100,
                    ]}
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#64748B",
                      fontSize: 12,
                    }}
                  />

                  <Tooltip
                    cursor={false}
                    contentStyle={{
                      borderRadius: "14px",
                      border: "1px solid #E5E7EB",
                      boxShadow:
                        "0 10px 30px rgba(0,0,0,0.08)",
                        marginBottom: "100px",
                    }}
                  />

                  <Bar
                    dataKey="value"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={48}
                  >
                    {data.map((item, index) => (
                      
                      <Cell
                        key={index}
                        className={item.value >= 61 ? "fill-gray-300 duration-300 hover:fill-red-600" : 
                          item.value >= 41 ? "fill-gray-300 duration-300 hover:fill-[#ff9100]" : 
                          item.value >= 31 ? "fill-gray-300 duration-300 hover:fill-[#FFFF00]" : "fill-gray-300 duration-300 hover:fill-[#0F8A5F]"}
                      />
                    ))}
                  </Bar>

                </BarChart>

              </ResponsiveContainer>

            </div>


            {/* LEGEND */}

            <div className="mt-2 flex flex-wrap justify-center gap-5 text-sm  text-gray-500">

              <div className="flex items-center gap-2">

                <span className="h-4 w-4 rounded-full bg-[#0F8A5F]"></span>

                <span>
                  0–30 Бага
                </span>

              </div>


              <div className="flex items-center gap-2">

                <span className="h-4 w-4 rounded-full bg-yellow-400"></span>

                <span>
                  31–40 Дунд
                </span>

              </div>


              <div className="flex items-center gap-2">

                <span className="h-4 w-4 rounded-full bg-[#ff9100]"></span>

                <span>
                  41-60 Их
                </span>

              </div>

              <div className="flex items-center gap-2">

                <span className="h-4 w-4 rounded-full bg-red-500"></span>

                <span>
                  61-100 Маш их
                </span>

              </div>

            </div>

          </div>

        </div>


        {/* ================================================= */}
        {/* INSURANCE SECTION */}
        {/* ================================================= */}

        <div className="mt-12">

          {/* TITLE */}

          <div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Эрсдэлийг хамгаалах даатгалууд
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Эрсдэлийн үнэлгээнд суурилсан даатгалын саналууд
            </p>

          </div>


          {/* ================================================= */}
          {/* FILTER BUTTONS */}
          {/* ================================================= */}

          <div className="mt-6 inline-flex flex-wrap rounded-full border border-gray-200 bg-white p-1 shadow-sm">

            {[
              {
                id: 1,
                label: "Бүгд",
              },
              {
                id: 2,
                label: "Эд хөрөнгө",
              },
              {
                id: 3,
                label: "Хариуцлага",
              },
              {
                id: 4,
                label: "Тээвэр",
              },
            ].map((item) => (

              <button
                key={item.id}
                onClick={() => {
                  setActive(item.id);
                  setExpanded(null);
                }}
                className={`rounded-full px-4 py-2 text-sm font-medium transition duration-200 ${
                  active === item.id
                    ? "bg-red-500 text-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {item.label}
              </button>

            ))}

          </div>


          {/* ================================================= */}
          {/* INSURANCE LIST */}
          {/* ================================================= */}

          <div className="mt-5 space-y-3">

            {filteredData.map((item) => (

              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:border-red-200 hover:shadow-md"
              >


                {/* ================================================= */}
                {/* MAIN INSURANCE CARD */}
                {/* ================================================= */}

                <div className="flex items-center justify-between gap-4 p-5">

                  {/* LEFT */}

                  <div className="flex min-w-0 items-center gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500">

                      <img
                        src={shield}
                        alt="shield"
                        className="w-6"
                      />

                    </div>


                    <div className="min-w-0">

                      <h3 className="text-base font-bold text-gray-900">
                        {item.name}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {item.description}
                      </p>

                    </div>

                  </div>


                  {/* DETAIL BUTTON */}
                  <button
                    onClick={() =>
                      setExpanded(
                        expanded === item.id
                          ? null
                          : item.id
                      )
                    }
                    className={`flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
                      expanded === item.id
                        ? "bg-red-500 text-white"
                        : "border border-gray-200 bg-white  hover:bg-red-500 hover:text-white"
                    }`}
                  >

                    {expanded === item.id
                      ? "Хаах"
                      : "Дэлгэрэнгүй"}

                    <span
                      className={`text-lg leading-none transition-transform duration-300 ${
                        expanded === item.id
                          ? "rotate-180"
                          : "rotate-0"
                      }`}
                    >
                      ↓
                    </span>

                  </button>

                </div>


                {/* ================================================= */}
                {/* MAIN DETAIL ANIMATION */}
                {/* ================================================= */}

                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    expanded === item.id
                      ? "max-h-125 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >

                  <div className="border-t border-gray-100 bg-gray-50/70 px-6 py-5">


                    {/* ================================================= */}
                    {/* COVERAGE + BENEFIT */}
                    {/* ================================================= */}

                    <div className="grid gap-4 md:grid-cols-2">


                      {/* ================================================= */}
                      {/* COVERAGE */}
                      {/* ================================================= */}

                      <div
                        className={`rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-500 ease-out ${
                          expanded === item.id
                            ? "translate-x-0 translate-y-0 opacity-100 delay-100"
                            : "-translate-x-10 translate-y-3 opacity-0"
                        }`}
                      >

                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50">

                            <span className="text-red-500">
                              ✓
                            </span>

                          </div>


                          <p className="text-md font-bold text-gray-900">
                            Хамрах хүрээ
                          </p>

                        </div>


                        <div
                          className={`mt-3 transition-all duration-500 ${
                            expanded === item.id
                              ? "translate-y-0 opacity-100 delay-300"
                              : "translate-y-3 opacity-0"
                          }`}
                        >

                          <p className="text-md leading-6 text-gray-600">
                            {item.coverage}
                          </p>

                        </div>

                      </div>


                      {/* ================================================= */}
                      {/* BENEFIT */}
                      {/* ================================================= */}

                      <div
                        className={`rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-500 ease-out ${
                          expanded === item.id
                            ? "translate-x-0 translate-y-0 opacity-100 delay-300"
                            : "translate-x-10 translate-y-3 opacity-0"
                        }`}
                      >

                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50">

                            <span className="text-green-500">
                              ✓
                            </span>

                          </div>

                          <p className="text-md font-bold text-gray-900">
                            Давуу тал
                          </p>

                        </div>


                        <div
                          className={`mt-3 transition-all duration-500 ${
                            expanded === item.id
                              ? "translate-y-0 opacity-100 delay-500"
                              : "translate-y-3 opacity-0"
                          }`}
                        >

                          <p className="text-md leading-6 text-gray-600">
                            {item.benefit}
                          </p>

                        </div>

                      </div>

                    </div>


                    {/* ================================================= */}
                    {/* RECOMMENDATION */}
                    {/* ================================================= */}

                    <div
                      className={`mt-4 flex flex-col gap-4 rounded-xl bg-[#ebfff3] p-4 transition-all duration-500 ease-out sm:flex-row sm:items-center sm:justify-between ${
                        expanded === item.id
                          ? "translate-y-0 opacity-100 delay-500"
                          : "translate-y-5 opacity-0"
                      }`}
                    >

                      <div>

                        <p className="text-lg font-bold text-[#486c26]">
                          Танд санал болгож байна
                        </p>

                        <p className="mt-1 text-sm text-[#486c26]">
                          Эрсдэлийн үнэлгээнд үндэслэн сонгогдсон даатгал
                        </p>

                      </div>


                      <button
                        className="rounded-xl bg-[#55a630] px-5 py-2.5 text-sm font-semibold text-white transition duration-200 hover:bg-green-600 hover:shadow-md"
                      >
                        Нэмэлт үйлчилгээ
                      </button>

                    </div>

                  </div>

                </div>

              </div>

            ))}


            {/* ================================================= */}
            {/* EMPTY STATE */}
            {/* ================================================= */}

            {filteredData.length === 0 && (

              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">

                <p className="text-gray-500">
                  Энэ ангилалд тохирох даатгал одоогоор байхгүй байна.
                </p>

              </div>

            )}

          </div>

        </div>

      </div>

    </div>
  );
};

export default Home;
