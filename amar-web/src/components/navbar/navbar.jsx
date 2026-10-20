
import { useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { Menu, X, ShieldCheck, ChevronRight } from "lucide-react";

import logo from "../../assets/logo.svg";
import fb from "../../assets/fb.png";
import ig from "../../assets/ig.png";

const navItems = [
  {
    label: "Даатгалын санал",
    path: "insurance-offer",
  },
  {
    label: "Эрсдэлийн үнэлгээ",
    path: "riskAssesment",
  },
  {
    label: "Нэмэлт үйлчилгээ",
    path: "additional",
  },
  {
    label: "Бүх даатгал",
    path: "insurances",
  },
];

function Navbar() {
  const { id } = useParams();
  const [menuOpen, setMenuOpen] = useState(false);

  const getPath = (path) => `/${id}/${path}`;

  const linkClass = ({ isActive }) =>
    `relative flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
      isActive
        ? "bg-red-500 text-white shadow-md shadow-red-500/20"
        : "text-slate-600 hover:bg-red-50 hover:text-red-600"
    }`;

  return (
    <header className="sticky top-0 z-40 w-full px-3 pt-3 sm:px-5 lg:px-8">
      <nav className="mx-auto max-w-8xl rounded-2xl border border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl">
        <div className="flex min-h-17 items-center justify-between gap-3 px-4 py-3 sm:px-5 lg:px-6">

          {/* LOGO */}
          <NavLink
            to={getPath("insurance-offer")}
            onClick={() => setMenuOpen(false)}
            className="flex shrink-0 items-center gap-2.5"
            aria-label="AMAR нүүр хуудас"
          >
            <img
              src={logo}
              alt="AMAR"
              className="h-9 w-auto object-contain sm:h-10"
            />
          </NavLink>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden flex-1 justify-center lg:flex">
            <ul className="flex items-center gap-1 rounded-2xl bg-slate-50 p-1.5">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={getPath(item.path)}
                    className={linkClass}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* SOCIAL LINKS */}
          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <SocialLink
              href="https://www.instagram.com/amarinsurance"
              src={ig}
              alt="Instagram"
            />
            <SocialLink
              href="https://www.facebook.com/amarinsurance"
              src={fb}
              alt="Facebook"
            />
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? "Цэс хаах" : "Цэс нээх"}
            aria-expanded={menuOpen}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 lg:hidden"
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>

        {/* MOBILE NAVIGATION */}
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out lg:hidden ${
            menuOpen
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }`}
          aria-hidden={!menuOpen}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="border-t border-slate-100 px-3 pb-4 pt-3 sm:px-5">
              <ul className="space-y-1.5">
                {navItems.map((item, index) => (
                  <li
                    key={item.path}
                    style={{ transitionDelay: menuOpen ? `${index * 35}ms` : "0ms" }}
                    className={`transition-all duration-200 ${
                      menuOpen
                        ? "translate-y-0 opacity-100"
                        : "-translate-y-1 opacity-0"
                    }`}
                  >
                    <NavLink
                      to={getPath(item.path)}
                      tabIndex={menuOpen ? 0 : -1}
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-semibold transition ${
                          isActive
                            ? "bg-red-50 text-red-600"
                            : "text-slate-600 hover:bg-slate-50 hover:text-red-600"
                        }`
                      }
                    >
                      <span>{item.label}</span>
                      <ChevronRight size={17} />
                    </NavLink>
                  </li>
                ))}
              </ul>

              {/* MOBILE SOCIAL LINKS */}
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck size={16} className="text-red-500" />
                  <span>AMAR даатгал</span>
                </div>

                <div className="flex items-center gap-2">
                  <SocialLink
                    href="https://www.instagram.com/amarinsurance"
                    src={ig}
                    alt="Instagram"
                  />
                  <SocialLink
                    href="https://www.facebook.com/amarinsurance"
                    src={fb}
                    alt="Facebook"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

function SocialLink({ href, src, alt }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={alt}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white transition duration-200 hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50"
    >
      <img
        src={src}
        alt=""
        className="h-4.5 w-4.5 object-contain"
      />
    </a>
  );
}

export default Navbar;
