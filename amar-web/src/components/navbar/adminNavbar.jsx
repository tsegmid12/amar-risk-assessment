import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import {
  LayoutDashboard,
  Building2,
  ClipboardCheck,
  ShieldCheck,
  ShieldPlus,
  Plus,
  Menu,
  X,
  Search,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  UserRound,
  Pencil,
  ClipboardPlus 
} from "lucide-react";

const menuItems = [
   {
    title: "ХЯНАЛТ",
    items: [
      {
        name: "Хянах самбар",
        path: "/admin",
        icon: LayoutDashboard,
      },
      {
        name: "Эрсдэлийн үнэлгээ",
        path: "/admin/all-risk-assessment",
        icon: ClipboardCheck,
      },
       {
        name: "Даатгалын жагсаалт",
        path: "/admin/insurances",
        icon: ShieldCheck,
      },
    ],
  },
  {
    title: "ДААТГАЛ",
    items: [
     
      {
        name: "Үнэлгээ нэмэх",
        path: "/admin/add-risk",
        icon: Plus,
      },
    ],
  },
]

const menuItemsSuperAdmin = [
  {
    title: "ХЯНАЛТ",
    items: [
      {
        name: "Хянах самбар",
        path: "/admin",
        icon: LayoutDashboard,
      },
      {
        name: "Даатгалын жагсаалт",
        path: "/admin/insurances",
        icon: ShieldCheck,
      },
      {
        name: "Эрсдэлийн үнэлгээ",
        path: "/admin/all-risk-assessment",
        icon: ClipboardCheck,
      },
    ],
  },
  {
    title: "ДААТГАЛ",
    items: [
      {
        name: "Үнэлгээ нэмэх",
        path: "/admin/add-risk",
        icon: ClipboardPlus,
      },
      {
        name: "Даатгал нэмэх",
        path: "/admin/add-insurance",
        icon: ShieldPlus,
      },
      {
        name: "Даатгал засах",
        path: "/admin/products",
        icon: Pencil,
      },
     {
      name: "Хэрэглэгч удирдах",
      path: "/admin/manage-users",
      icon: UserRound,
     }
    ],
  },
];

export default function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const user = jwtDecode(token);
  const userRole = user?.role || null;

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState("");


  const handleLogout = () => {
    const confirmLogout = window.confirm("Та системээс гарахдаа итгэлтэй байна уу?");
    if (confirmLogout) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/admin/login", { replace: true });
    }
  }

  const currentPage =
    menuItemsSuperAdmin
      .flatMap((section) => section.items)
      .find((item) => item.path === location.pathname)?.name ||
    "Хянах самбар";

  const goTo = (path) => {
    navigate(path);
    setMobileOpen(false);
    setProfileOpen(false);
  };

    const currentPageAdmin =
    menuItems
      .flatMap((section) => section.items)
      .find((item) => item.path === location.pathname)?.name ||
    "Хянах самбар";



  return (
    <>
      {userRole === "superadmin" ? (
           <div>
      {/* Гар утасны арын давхарга */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Цэс хаах"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-gray-900/40 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-gray-200 bg-white transition-all duration-300
          ${collapsed ? "lg:w-22"  : "lg:w-65"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          w-65`}
      >
        {/* Logo */}
        <div className="flex h-19 shrink-0 items-center justify-between border-b border-gray-100 px-5">
          <button
            type="button"
            onClick={() => goTo("/admin")}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-600 text-lg font-extrabold text-white shadow-md shadow-red-200">
              A
            </div>

            {!collapsed && (
              <div className="text-left">
                <h1 className="text-lg font-extrabold tracking-wide text-gray-900">
                  AMAR
                </h1>
                <p className="text-[11px] text-gray-400">
                  Даатгалын систем
                </p>
              </div>
            )}
          </button>

          <button
            type="button"
            aria-label="Цэс хаах"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-7 overflow-y-auto px-3 py-6">
          {menuItemsSuperAdmin.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <p className="mb-3 px-3 text-[10px] font-bold tracking-[0.15em] text-gray-400">
                  {section.title}
                </p>
              )}

              <div className="space-y-1.5">
                {section.items.map((item) => {
                  const Icon = item.icon;

                  const active =
                    location.pathname === item.path ||
                    (item.path !== "/admin" &&
                      location.pathname.startsWith(`${item.path}/`));

                  return (
                    <button
                      key={item.path}
                      type="button"
                      title={collapsed ? item.name : undefined}
                      onClick={() => goTo(item.path)}
                      className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200
                        ${
                          active
                            ? "bg-red-50 text-red-600"
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                        }
                        ${collapsed ? "lg:justify-center" : ""}`}
                    >
                      {active && (
                        <span className="absolute bottom-2 left-0 top-2 w-0.75 rounded-r-full bg-red-600" />
                      )}

                      <Icon
                        size={20}
                        className={`shrink-0 transition-colors ${
                          active
                            ? "text-red-600"
                            : "text-gray-400 group-hover:text-gray-700"
                        }`}
                      />

                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left">
                            {item.name}
                          </span>

                          {active && (
                            <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar bottom */}
        <div className="shrink-0 border-t border-gray-100 p-3">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden w-full items-center justify-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-500 transition hover:bg-gray-50 hover:text-gray-900 lg:flex"
          >
            {collapsed ? (
              <PanelLeftOpen size={20} />
            ) : (
              <>
                <PanelLeftClose size={20} />
                <span>Цэс хураах</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleLogout()}
            className="mt-1 flex w-full items-center justify-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={20} />
            {!collapsed && <span>Гарах</span>}
          </button>
        </div>
      </aside>

      {/* TOP NAVBAR */}
      <header
        className={`sticky top-0 z-30 flex h-19 items-center justify-between border-b border-gray-200 bg-white/95 px-4 backdrop-blur-md transition-all duration-300 sm:px-6
          ${collapsed ? "lg:ml-22" : "lg:ml-65"}`}
      >
        {/* Left side */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            aria-label="Цэс нээх"
            onClick={() => setMobileOpen(true)}
            className="rounded-xl p-2 text-gray-600 transition hover:bg-gray-100 lg:hidden"
          >
            <Menu size={22} />
          </button>

          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-gray-900 sm:text-lg">
              {currentPage}
            </h2>

            <div className="mt-0.5 hidden items-center gap-1.5 text-xs text-gray-400 sm:flex">
              <span>AMAR</span>
              <span>/</span>
              <span className="text-red-600">{currentPage}</span>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-4">

          {/* Admin profile */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-gray-50 sm:px-3 sm:py-2"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-600">
                <UserRound size={19} />
              </div>

              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold text-gray-800">
                  {user?.email?.split('@')[0] || "Админ"}
                </p>
                <p className="text-[11px] text-gray-400">
                  {user?.role === "superadmin" ? "Супер админ" : "Админ"}
                </p>
              </div>

              <ChevronDown
                size={16}
                className="hidden text-gray-400 sm:block"
              />
            </button>

            {profileOpen && (
              <>
                <button
                  type="button"
                  aria-label="Цэс хаах"
                  onClick={() => setProfileOpen(false)}
                  className="fixed inset-0 z-40 cursor-default"
                />

                <div className="absolute right-0 top-14 z-50 w-52 rounded-xl border border-gray-100 bg-white p-2 shadow-xl shadow-gray-200/60">
                  <div className="border-b border-gray-100 px-3 py-2">
                    <p className="text-sm font-semibold text-gray-800">
                      Админ
                    </p>
                    <p className="text-xs text-gray-400">
                      Системийн удирдлага
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleLogout()}
                    className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-gray-600 transition hover:bg-gray-50"
                  >
                    <LogOut size={16} />
                    Гарах
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
    </div>
      ) : (
           <div>
      {/* Гар утасны арын давхарга */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Цэс хаах"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-gray-900/40 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-gray-200 bg-white transition-all duration-300
          ${collapsed ? "lg:w-22" : "lg:w-65"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          w-65`}
      >
        {/* Logo */}
        <div className="flex h-19 shrink-0 items-center justify-between border-b border-gray-100 px-5">
          <button
            type="button"
            onClick={() => goTo("/admin")}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-600 text-lg font-extrabold text-white shadow-md shadow-red-200">
              A
            </div>

            {!collapsed && (
              <div className="text-left">
                <h1 className="text-lg font-extrabold tracking-wide text-gray-900">
                  AMAR
                </h1>
                <p className="text-[11px] text-gray-400">
                  Даатгалын систем
                </p>
              </div>
            )}
          </button>

          <button
            type="button"
            aria-label="Цэс хаах"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-7 overflow-y-auto px-3 py-6">
          {menuItems.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <p className="mb-3 px-3 text-[10px] font-bold tracking-[0.15em] text-gray-400">
                  {section.title}
                </p>
              )}

              <div className="space-y-1.5">
                {section.items.map((item) => {
                  const Icon = item.icon;

                  const active =
                    location.pathname === item.path ||
                    (item.path !== "/admin" &&
                      location.pathname.startsWith(`${item.path}/`));

                  return (
                    <button
                      key={item.path}
                      type="button"
                      title={collapsed ? item.name : undefined}
                      onClick={() => goTo(item.path)}
                      className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200
                        ${
                          active
                            ? "bg-red-50 text-red-600"
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                        }
                        ${collapsed ? "lg:justify-center" : ""}`}
                    >
                      {active && (
                        <span className="absolute bottom-2 left-0 top-2 w-0.75 rounded-r-full bg-red-600" />
                      )}

                      <Icon
                        size={20}
                        className={`shrink-0 transition-colors ${
                          active
                            ? "text-red-600"
                            : "text-gray-400 group-hover:text-gray-700"
                        }`}
                      />

                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left">
                            {item.name}
                          </span>

                          {active && (
                            <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar bottom */}
        <div className="shrink-0 border-t border-gray-100 p-3">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden w-full items-center justify-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-500 transition hover:bg-gray-50 hover:text-gray-900 lg:flex"
          >
            {collapsed ? (
              <PanelLeftOpen size={20} />
            ) : (
              <>
                <PanelLeftClose size={20} />
                <span>Цэс хураах</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleLogout()}
            className="mt-1 flex w-full items-center justify-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={20} />
            {!collapsed && <span>Гарах</span>}
          </button>
        </div>
      </aside>

      {/* TOP NAVBAR */}
      <header
        className={`sticky top-0 z-30 flex h-19 items-center justify-between border-b border-gray-200 bg-white/95 px-4 backdrop-blur-md transition-all duration-300 sm:px-6
          ${collapsed ? "lg:ml-22" : "lg:ml-65"}`}
      >
        {/* Left side */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            aria-label="Цэс нээх"
            onClick={() => setMobileOpen(true)}
            className="rounded-xl p-2 text-gray-600 transition hover:bg-gray-100 lg:hidden"
          >
            <Menu size={22} />
          </button>

          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-gray-900 sm:text-lg">
              {currentPageAdmin}
            </h2>

            <div className="mt-0.5 hidden items-center gap-1.5 text-xs text-gray-400 sm:flex">
              <span>AMAR</span>
              <span>/</span>
              <span className="text-red-600">{currentPageAdmin}</span>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-4">

          {/* Admin profile */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-gray-50 sm:px-3 sm:py-2"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-600">
                <UserRound size={19} />
              </div>

              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold text-gray-800">
                  {user?.email?.split('@')[0] || "Админ"}
                </p>
                <p className="text-[11px] text-gray-400">
                  {user?.role === "superadmin" ? "Супер админ" : "Админ"}
                </p>
              </div>

              <ChevronDown
                size={16}
                className="hidden text-gray-400 sm:block"
              />
            </button>

            {profileOpen && (
              <>
                <button
                  type="button"
                  aria-label="Цэс хаах"
                  onClick={() => setProfileOpen(false)}
                  className="fixed inset-0 z-40 cursor-default"
                />

                <div className="absolute right-0 top-14 z-50 w-52 rounded-xl border border-gray-100 bg-white p-2 shadow-xl shadow-gray-200/60">
                  <div className="border-b border-gray-100 px-3 py-2">
                    <p className="text-sm font-semibold text-gray-800">
                      Админ
                    </p>
                    <p className="text-xs text-gray-400">
                      Системийн удирдлага
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleLogout()}
                    className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-gray-600 transition hover:bg-gray-50"
                  >
                    <LogOut size={16} />
                    Гарах
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
    </div>
      )}
    </>
 
  );
}
