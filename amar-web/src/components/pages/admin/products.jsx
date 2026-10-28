
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Pencil,
  ArrowUpRight,
  FileText,
  Layers,
  LoaderCircle,
  Search,
  Trash2
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  const handleDelete = async (productId) => {
    try{
      const confirmDelete = window.confirm("Та энэ даатгалын бүтээгдэхүүнийг устгахдаа итгэлтэй байна уу?");
      if (!confirmDelete) return;
      await axios.delete(`${API_URL}/products/${productId}`);
      navigate(0)
    } catch (error) {
      console.error("Error deleting product:", error);
      setError("Даатгалын бүтээгдэхүүн устгаж чадсангүй.");
    }
  }

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/insurance-products`
        );

        const data = response.data;
        const productList = Array.isArray(data)
          ? data
          : data.insuranceProducts;

        if (!Array.isArray(productList)) {
          throw new Error("API бүтээгдэхүүний жагсаалт буцаасангүй.");
        }

        setProducts(productList);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Даатгалын бүтээгдэхүүн татахад алдаа гарлаа.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
  const search = searchTerm.trim().toLowerCase();

  if (!search) return true;

  return [
    product.name,
    product.category,
  ].some((value) =>
    String(value ?? "").toLowerCase().includes(search)
  );
});

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-8 sm:py-10">
      <div className="mx-auto w-full min-w-0 space-y-7 p-4 sm:p-6 md:px-8 lg:p-10 lg:pl-85 lg:pr-20">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600">
              <ShieldCheck size={16} />
              AMAR · Админ удирдлага
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Даатгалын бүтээгдэхүүн
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-500 sm:text-base">
              Даатгалын мэдээллийг харах, засах, удирдах.
            </p>
          </div>

          <div className="flex w-fit items-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-3 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Layers size={23} />
            </div>
            <div>
              <p className="text-xs text-gray-500">
                Нийт бүтээгдэхүүн
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {products.length}
              </p>
            </div>
          </div>
        </div>

        <div className="relative mb-6">
            <Search
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
                type="text"
                placeholder="Нэр, ангилал, үйлчилгээ хайх..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <LoaderCircle
              size={36}
              className="mb-3 animate-spin text-red-500"
            />
            <p className="text-sm">Бүтээгдэхүүн ачаалж байна...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-center">
            <p className="font-medium text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Дахин оролдох
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && products.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <ShieldCheck
              size={44}
              className="mx-auto mb-4 text-gray-300"
            />
            <h2 className="text-lg font-semibold text-gray-800">
              Бүтээгдэхүүн олдсонгүй
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Одоогоор бүртгэлтэй даатгалын бүтээгдэхүүн алга байна.
            </p>
          </div>
        )}

        {/* Product cards */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-xl hover:shadow-red-900/5"
              >

                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 transition-colors duration-300 group-hover:bg-red-600 group-hover:text-white">
                      <ShieldCheck size={28} strokeWidth={1.8} />
                    </div>

                    {product.category && (
                      <span className="max-w-[55%] rounded-full bg-gray-100 px-3 py-1.5 text-right text-xs font-medium text-gray-600">
                        {product.category}
                      </span>
                    )}
                  </div>

                  <h2 className="mb-3 text-xl font-bold leading-snug text-gray-900 transition-colors group-hover:text-red-600">
                    {product.name}
                  </h2>

                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    <FileText size={14} />
                    Бүтээгдэхүүний тайлбар
                  </div>

                  <p className="mb-6 line-clamp-3 flex-1 text-sm leading-6 text-gray-600">
                    {product.description || "Тайлбар оруулаагүй байна."}
                  </p>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/admin/edit-insurances/${product._id}`)
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-red-600/20 transition-all hover:bg-red-700 active:scale-[0.98]"
                    >
                      <Pencil size={16} />
                      Засах
                      <ArrowUpRight
                        size={16}
                        className="ml-auto transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </button>
                    <Trash2
                      size={24}
                      className="ml-auto cursor-pointer text-red-500 hover:text-red-700 hover:scale-120 duration-200 transition-transform "
                      onClick={() => handleDelete(product._id)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
