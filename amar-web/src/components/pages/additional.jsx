import { useState, useEffect } from 'react';
import shield from '../../assets/shield.png';
import offer from '../../assets/offer.png';

const Additional = () => {
  const [activeCategory, setActiveCategory] = useState('Бүгд');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const additionalServices = [
    {
      category: "Хууль зүйн зөвлөгөө",
      services: [
        {
          id: 'legal-1',
          title: "Гэрээний зөвлөх",
          description: "Бизнесийн гэрээ, хэлцэл, дотоод журмыг боловсруулах, хянах үйлчилгээ.",
          icon: shield,
          benefit: "Эрсдэлийг урьдчилан сэргийлж, хууль эрх зүйн найдвартай байдлыг хангана."
        },
        {
          id: 'legal-2',
          title: "Маргаан шийдвэрлэлт",
          description: "Иргэний болон арбитрийн шүүхийн төлөөлөл, зөвлөгөө өгөх.",
          icon: shield,
          benefit: "Маргааныг хамгийн оновчтой арга замаар, хурдан хугацаанд шийдвэрлүүлнэ."
        },
      ]
    },
    {
      category: "Санхүүгийн зөвлөх",
      services: [
        {
          id: 'fin-1',
          title: "Эрсдэлийн удирдлага",
          description: "Байгууллагын санхүүгийн эрсдэлийг тооцоолж, удирдах стратеги боловсруулах.",
          icon: offer,
          benefit: "Санхүүгийн алдагдлыг бууруулж, тогтвортой өсөлтийг дэмжинэ."
        },
        {
          id: 'fin-2',
          title: "Даатгалын оновчлол",
          description: "Даатгалын багцыг эрсдэлээс хамаарч хамгийн хэмнэлттэйгээр тохируулах.",
          icon: offer,
          benefit: "Илүү төлбөрөөс зайлсхийж, хамгийн өндөр хамгаалалтыг авна."
        },
      ]
    },
    {
      category: "Хурддан үйлчилгээ",
      services: [
        {
          id: 'fast-1',
          title: "Шуурхай нөхөн төлбөр",
          description: "Даатгалын хохирлыг хамгийн богино хугацаанд шийдвэрлэх Fast-track үйлчилгээ.",
          icon: shield,
          benefit: "Бизнесийн үйл ажиллагааг тасалдуулахгүйгээр хурдан сэргээнэ."
        },
      ]
    }
  ];

  const categories = ['Бүгд', ...additionalServices.map(item => item.category)];

  const filteredServices = activeCategory === 'Бүгд'
    ? additionalServices.flatMap(cat => cat.services)
    : additionalServices.find(cat => cat.category === activeCategory)?.services || [];

  return (
    <div className='p-6 lg:p-12 min-h-screen bg-gray-50/50'>
      {/* Hero Section */}
      <div className='max-w-6xl mx-auto mb-12 transition-all duration-1000 ease-out opacity-100 translate-y-0'>
        <h1 className='text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-gray-900 to-gray-300 mb-3'>
          Нэмэлт үйлчилгээ
        </h1>
        <p className='text-gray-500 text-lg mb-8 max-w-2xl'>
          Бизнесийн тань эрсдэлийг бүрэн хамгаалж, үйл ажиллагааг оновчтой болгох мэргэжлийн зөвлөх үйлчилгээнүүд.
        </p>

        {/* Category Filter Bar */}
        <div className='flex flex-wrap gap-3 items-center bg-white/60 backdrop-blur-md p-3 rounded-2xl border border-gray-200 shadow-sm w-fit'>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${
                activeCategory === cat
                ? 'bg-red-600 text-white shadow-lg shadow-red-200 scale-105'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-red-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {filteredServices.map((service, index) => (
          <div
            key={service.id}
            className={`group relative flex flex-col bg-white border border-l-red-500 border-l-4 border-gray-200 rounded-3xl shadow-sm transition-all duration-300 ease-out hover:shadow-xl hover:border-red-200 hover:-translate-y-1 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          >

            <div className='p-8'>
              
              <div className="flex flex-col h-full">
                <div className='relative w-14 h-14 mb-6'>
                  <div className='absolute inset-0 blur-lg opacity-30 rounded-full bg-red-500'></div>
                  <img src={service.icon} alt="Icon" className="relative w-full h-full p-3 bg-white rounded-2xl border border-gray-100 shadow-sm" />
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors duration-300">
                  {service.title}
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6 grow">
                  {service.description}
                </p>

                <div className='pt-6 border-t border-gray-100'>
                  <div className='flex items-start gap-3 p-3 rounded-2xl bg-green-50 text-green-700'>
                    <span className='text-lg font-bold'>✓</span>
                    <p className='text-sm font-medium leading-snug'>
                      {service.benefit}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredServices.length === 0 && (
        <div className='max-w-6xl mx-auto text-center py-20 opacity-50'>
          <p className='text-xl text-gray-500'>Сонгосон ангилалд үйлчилгээ олдсонгүй.</p>
        </div>
      )}
    </div>
  );
};

export default Additional;
