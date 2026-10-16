
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import logo from "../../../assets/logo.svg";

import {Mail,  LockKeyhole,  Eye,  EyeOff,  ArrowRight,} from "lucide-react";

export default function Login() {

  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

 
const handleLogin = async (e) => {
  e.preventDefault();
  setError("");

  if (!email.trim() || !password) {
    setError("Имэйл болон нууц үгээ оруулна уу.");
    return;
  }

  setLoading(true);

  try {
    const response = await axios.post(
      `${API_URL}/login`,
      {
        email: email.trim(),
        password,
      }
    );

    const { token, user } = response.data;

    if (!token) {
      setError("Серверээс JWT token ирсэнгүй.");
      return;
    }

    // Backend хэрэглэгчийн мэдээлэл буцаагаагүй
    // тохиолдолд JWT payload-аас уншина.
    const userData = user || jwtDecode(token);

    // JWT болон хэрэглэгчийн мэдээллийг хадгална
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("userId", userData._id);


    // Admin самбар руу шилжинэ
    navigate("/admin", { replace: true });
  } catch (err) {
    setError(
      err.response?.data?.message ||
      (err.code === "ERR_NETWORK"
        ? "Сервертэй холбогдож чадсангүй."
        : "Имэйл эсвэл нууц үг буруу байна.")
    );
  } finally {
    setLoading(false);
  }
};


  return (
    <main className=" flex min-h-screen bg-slate-100 p-3 font-sans sm:p-6 lg:p-8">
      <div className="mx-auto min-h-[calc(100vh-46px)] min-w-80 sm:min-w-120 md:min-w-160  overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/70 lg:grid-cols-2">
        <section className="flex items-center justify-center px-6 py-10 sm:px-12 lg:px-16">
          <div className="w-full max-w-md">
            <div className="mb-2 flex items-center justify-between">
              <img src={logo} alt="Logo" className="h-40 w-40" />
              <span className="text-sm text-slate-400">
                Тавтай морил
              </span>
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Нэвтрэх
            </h2>

            <form onSubmit={handleLogin} className="mt-9 space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Имэйл хаяг
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-red-400 focus-within:ring-4 focus-within:ring-red-50">
                  <Mail size={20} className="shrink-0 text-slate-400" />

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Нууц үг
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-red-400 focus-within:ring-4 focus-within:ring-red-50">
                  <LockKeyhole
                    size={20}
                    className="shrink-0 text-slate-400"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Нууц үгээ оруулна уу"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Нууц үг нуух" : "Нууц үг харуулах"
                    }
                    className="text-slate-400 transition hover:text-red-600"
                  >
                    {showPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-red-600 font-bold text-white shadow-lg shadow-red-200/60 transition hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Нэвтэрч байна..." : "Нэвтрэх"}
                {!loading && (
                  <ArrowRight
                    size={20}
                    className="transition group-hover:translate-x-1"
                  />
                )}
              </button>
              <div className="h-px flex-1 bg-slate-200" />

              <button onClick={() => navigate('/admin/register')} className="flex border border-red-500 w-full h-14 items-center justify-center rounded-xl font-bold text-red-500 transition hover:bg-red-100 hover:-translate-y-0.5">
                Бүртгүүлэх
              </button>

            </form>

            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-medium text-slate-400">
                AMAR ДААТГАЛ
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>  

            <p className="mt-10 text-center text-xs text-slate-400">
              © {new Date().getFullYear()} AMAR Даатгал. Бүх эрх хуулиар хамгаалагдсан.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
