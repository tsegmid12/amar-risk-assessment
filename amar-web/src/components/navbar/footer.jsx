
import React from "react";

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 px-4 py-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-sm font-bold text-red-600">
          AMAP ДААТГАЛ
        </p>

        <p className="text-center text-xs text-gray-500">
          © {new Date().getFullYear()} AMAR Даатгал. Бүх эрх хуулиар хамгаалагдсан.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
