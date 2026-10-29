
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const ForgotPasswordVerify = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
    const location = useLocation();
    const API_URL = import.meta.env.VITE_API_URL;  
    const navigate = useNavigate();
    const email = location.state?.email || '';

  const handleSubmit = async (e) => {
    try{
        e.preventDefault();
        setError('');
        if (code.length !== 6) {
        setError('6 оронтой баталгаажуулах код оруулна уу.');
        return;
        }

        if(code === '') {
            setError('Баталгаажуулах код хоосон байна.');
            return;
        }

        if(!location.state || !location.state.email) {
            setError('Имэйл хаяг олдсонгүй. Дахин бүртгэл хийж баталгаажуулна уу.');
            return;
        }

        const response = await axios.put(`${API_URL}/verify-reset-password-code`, {
            email: location.state.email,
            code
        });


        if (response.data.success) {
            navigate('/admin/reset-password', { state: { email: location.state.email } });
        }
    }
    catch (err) {
        setError(
            err.response?.data?.message ||
            (err.code === "ERR_NETWORK"
                ? "Сервертэй холбогдож чадсангүй."
                : "Баталгаажуулах код буруу байна.")
        );
    }
}


  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-md flex-col items-center gap-5 rounded-xl border border-gray-200 bg-white p-8 shadow-md"
      >
        <h1 className="text-xl font-bold text-gray-800">
          Имэйл баталгаажуулах
        </h1>

        <p className="text-center text-sm text-gray-500">
          {email} имэйлд илгээсэн 6 оронтой баталгаажуулалтын кодыг оруулна уу.
        </p>

        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(e) =>
            setCode(e.target.value)
          }
          placeholder="000000"
          className="w-full rounded-lg border border-gray-300 p-3 text-center text-2xl tracking-[0.5em] outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200"
          required
        />

        <button
          type="submit"
          className="w-full rounded-lg border  px-4 py-3 font-semibold text-red-500 transition hover:bg-red-500 hover:text-white"
        >
          Баталгаажуулах
        </button>
          <span className="text-sm text-gray-500" mb-2>Баталгаажуулах код 5 минутын дотор хүчингүй болно.</span>
        <span className="text-sm text-red-500">{error}</span>
      </form>
    </div>
  );
};

export default ForgotPasswordVerify;
