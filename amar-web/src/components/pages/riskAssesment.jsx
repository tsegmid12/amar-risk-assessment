import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";

const getRisk = (v) => {
  if (v <= 30)
    return {
      label: "Бага эрсдэл",
      color: "#059669",
      bar: "bg-emerald-600",
      text: "text-emerald-600",
    };
  if (v <= 40)
    return {
      label: "Дундаж эрсдэл",
      color: "#FDC700",
      bar: "bg-yellow-400",
      text: "text-yellow-400",
    };
  if (v <= 60)
    return {
      label: "Их эрсдэл", 
      color: "#FF9100",
      bar: "bg-[#ff9100]",
      text: "text-[#ff9100]",
    }
  return {
    label: "Өндөр эрсдэл",
    color: "#E7000B",
    bar: "bg-red-600",
    text: "text-red-600",
  };
};

const items = [
  { label: "Гал түймэр", value: 69 },
  { label: "Үер", value: 41 },
  { label: "Сантехник", value: 32 },
  { label: "Газар хөдлөлт", value: 20 },
  { label: "Гэнэтийн осол", value: 17 },
  
];

 const data2 = [
    {
      id: 1,
      name: "Хөрөнгийн иж бүрэн даатгал",
      category: "Эд хөрөнгө",
      risk: [
        "Гал түймэр",
        "Үер",
        "Газар хөдлөлт",
        "Сантехник",
      ],
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
      risk: ["Гал түймэр"],
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
      risk: ['Газар хөдлөлт'],
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
      risk: ['Гэнэтийн осол'],
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
      risk: ['Тээврийн хэрэгсэл'],
      description:
        "Тээврийн хэрэгсэлтэй холбоотой эрсдэлийг хамгаална.",
      coverage:
        "Зам тээврийн осол, хулгай болон байгалийн гамшгийн эрсдэлийг хамруулна.",
      benefit:
        "Тээврийн хэрэгслийн засвар үйлчилгээний зардлыг нөхөн төлнө.",
    },
  ];

const data =[
  {
    name: "Гал түймэр",
    value: 69,
    description: [
      "Галын аюулгүй байдлын үндсэн дүрэм",
      "Галын аюулгүй байдлыг хангах ерөнхий шаардлага",
      "Барилга байгууламжийн гал унтраах анхан шатны багаж хэрэгслээр хангах",
      "Барилга байгууламжид зөөврийн гал унтраагуурын норм",
      "Барилга байгууламжид гал унтраах автомат төхөөрөм, дохиоллын хэрэгсэл"
    ]
  },
  {
    name: "Үер",
    value: 40,
    description: [
      '1. Хэрэглэгчийн цахилгаан тоног төхөөрөмжийн техник ашиглалтын дүрэм',
      '2. Галын аюулгүй байдлын үндсэн дүрэм'
    ]
  },
  {
    name: "Сантехник",
    value: 41,
    description: [
      "1. Уурын ба халуун усны шугам хоолойг төхөөрөмжлөх аюулгүй ашиглах дүрэм",
      "2. Барилга байгууламжийн өмчлөгч, эзэмшигчийн үүрэг"
    ]
  }

]

function RiskGauge({ value }) {
  const risk = getRisk(value);
  const chartData = [{ name: "risk", value, fill: risk.color }];

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md  rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <h2 className="text-center mb-6 text-2xl font-bold text-gray-900 ">Нийт эрсдэлийн түвшин</h2>
      <div className="relative mx-auto" style={{ width: 220, height: 220 }}>
        <RadialBarChart
          width={220}
          height={220}
          innerRadius={88}
          outerRadius={110}
          data={chartData}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar
            dataKey="value"
            cornerRadius={10}
            background={{ fill: "#f3f4f6" }}
          />
        </RadialBarChart>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold text-gray-900">{value}</span>
          <span className="mt-1 text-sm text-gray-500">/ 100</span>
        </div>
      </div>
        <span className={value > 61 ? 'mt-6 text-center text-md font-semibold text-red-500 bg-red-50 rounded-full border border-red-100 px-2 py-1' : 
          value >=41 ? 'mt-6 text-center text-md font-semibold text-[#ff9100] bg-amber-50 rounded-full border border-amber-100 px-2 py-1' : 
          value >= 31 ? 'mt-6 text-center text-md font-semibold text-yellow-400 bg-yellow-50 rounded-full border border-yellow-100 px-2 py-1' : 
          'mt-6 text-center text-md font-semibold text-emerald-600 bg-green-50 rounded-full border border-emerald-100 px-2 py-1'}>
          {risk.label}
        </span> 
        <p className="text-sm text-gray-500 mt-3">Нийт эрсдэлийн дундаж үзүүлэлт</p>
    </div> 
  );
}

function RiskDirections({ data }) {
  return (
    <div className="w-full max-w-4xl rounded-2xl border border-gray-200 bg-white p-6 px-12 shadow-sm">
      <h3 className="mb-1 text-2xl font-bold text-gray-900">
        Эрсдэлийн түвшин
      </h3>
      <p className="text-sm text-gray-500 mb-5">
        Байгууллагын эрсдэлийн түвшинг тус бүрээр харуулсан үзүүлэлт
      </p>

      <ul className="space-y-5 pr-10">
        {data.map(({ label, value }) => {
          const risk = getRisk(value);
          return (
            <li >
              <div className="flex justify-between gap-4">

              <p className="text-md pb-1 font-medium text-gray-900">
                {label}
              </p>

              <p className={`w-10 shrink-0 text-right text-md font-bold ${risk.text}`}>
                  {value}
                </p>
              </div>

                <div className="h-2 w-full flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full ${risk.bar} transition-[width] duration-700 ease-out`}
                    style={{ width: `${Math.min(value, 100)}%` }}
                  />
                </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-2 flex flex-wrap justify-center gap-5 text-sm  text-gray-500">        
        <div className="my-4  w-full h-0.5 bg-gray-100"/>
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-full bg-[#0F8A5F]"></span>
            <span>0–30 Бага</span>
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
  );
}

const RiskInfo = () => {
  return(
    <div className="flex flex-col px-10 sm:px-10 md:px-20 lg:px-60 items-center ">
    {data.map((item, index) => (
      <div key={index} className="w-full rounded-2xl border border-gray-200 bg-white p-6 px-12 shadow-sm mb-6">
        <div className="mb-1 flex items-center justify-between">
          <div className='flex gap-4 items-center mb-2'>
            <span className="text-lg font-bold text-gray-900 pr-2">{item.name}</span>
            <button className="text-sm border border-gray-300 px-4 p-1 rounded-xl hover:border-red-300 hover:text-red-500 duration-300">Зураг харах</button>
          </div>
          <span className={item.value > 61 ? 'text-xs text-red-500 border border-red-100 bg-red-50 rounded-full p-1 ' : 
            item.value >=41 ? 'text-xs text-orange-500 bg-orange-100 border border-orange-200 rounded-full p-1' : 
            item.value >= 31 ? 'text-xs text-yellow-500 bg-yellow-100 border border-yellow-200 rounded-full p-1' : 
            'text-xs text-emerald-500 bg-emerald-50 border border-emerald-100 rounded-full p-1'}>
            {item.value > 61 ? 'Өндөр эрсдэл' : item.value >= 41 ? 'Их эрсдэл' : item.value >= 31 ? 'Дундаж эрсдэл' : 'Бага эрсдэл'}
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-4">Эрсдэлийн үнэлгээ: <span className="font-medium text-md text-gray-700">{item.value}/100</span></p>
        
        

        <div className="flex justify-between gap-10">
          <div>
            {item.description.map((desc, i) => <p key={i} className='border-b border-gray-200 py-2'>{desc}</p>)}
          </div>
          <div className="w-3/4 overflow-y-auto">
          <h2 className="text-md font-bold text-gray-500 mb-4">Санал болгох даатгал</h2>
            {data2.map((dataItem, dataIndex) =>
             dataItem.risk.includes(item.name) && (
              <div key={dataIndex} className="flex border h-20 rounded-lg border-gray-200 p-4 mb-4 hover:border-red-200 hover:shadow-md transition-all duration-300">
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-2">{dataItem.name}</h4>
                  <p className="text-sm text-gray-500">{dataItem.description}</p>
                </div>
                <button className="ml-auto text-sm border my-1 border-gray-300 px-4 rounded-xl hover:border-red-300 hover:text-red-500 duration-300">Дэлгэрэнгүй</button>
              </div>
             )
            )}
          </div>
        </div>
      </div>
    ))}
    </div>
  )
}

export default function RiskAssessment({ value = 40, data = items }) {
  return (
    <>
    <div className="flex mx-auto justify-center gap-20 px-20 py-10">
      <RiskGauge value={value} />
      <RiskDirections data={data} />
    </div>
    <RiskInfo />
    </>
  );
}