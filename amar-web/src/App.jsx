
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useParams,
} from "react-router-dom";

import Navbar from "./components/navbar/navbar";
import Home from "./components/pages/home";
import RiskAssesment from "./components/pages/riskAssesment";
import Insurances from "./components/pages/Insurances";
import Additional from "./components/pages/additional";
import Footer from "./components/navbar/footer";


import Admin from "./components/pages/admin/admin";
import AddRisk from "./components/pages/admin/addRisk";
import AddInsurance from "./components/pages/admin/addInsurance";
import AllRiskAssessment from "./components/pages/admin/allRiskAssessments";
import AdminNavbar from "./components/navbar/adminNavbar";
import UpdateAssessment from "./components/pages/admin/updateAssessment";
import Login from "./components/pages/admin/login";

// ======================================
// ADMIN ROUTE PROTECTION
// ======================================
function ProtectedRoute() {
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  const token = localStorage.getItem("token");

  // Login хийгээгүй бол login хуудас руу
  if (!token || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}

const isLogged = JSON.parse(localStorage.getItem("user") || "null");

// ======================================
// CUSTOMER LAYOUT
// Login шаардлагагүй
// ======================================
function CustomerLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}

// ======================================
// ADMIN LAYOUT
// Зөвхөн ProtectedRoute-ийн дотор ажиллана
// ======================================
function AdminLayout() {
  return (
    <>
      <AdminNavbar />
      <Outlet />
    </>
  );
}

// ======================================
// APP ROUTES
// ======================================
function AppContent() {
  const { id } = useParams();

  return (
    <Routes>
      {/* ------------------------------ */}
      {/* ADMIN LOGIN - PUBLIC */}
      {/* ------------------------------ */}
      <Route
        path="/admin/login"
        element={<Login />}
      />

      {/* ------------------------------ */}
      {/* ADMIN PAGES - PROTECTED */}
      {/* ------------------------------ */}
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Admin />} />

          <Route
            path="insurances"
            element={<Insurances />}
          />

          <Route
            path="add-risk"
            element={<AddRisk />}
          />

          <Route
            path="add-insurance"
            element={<AddInsurance />}
          />

          <Route
            path="all-risk-assessment"
            element={<AllRiskAssessment />}
          />

          <Route
            path="update-assessment/:id"
            element={<UpdateAssessment />}
          />

          <Route
            path="*"
            element={<Navigate to="/admin" replace />}
          />
        </Route>
      </Route>

      {/* ------------------------------ */}
      {/* CUSTOMER PAGES - PUBLIC */}
      {/* ------------------------------ */}
      <Route path="/:id" element={<CustomerLayout />}>
        <Route
          index
          element={
            <Navigate
              to="insurance-offer"
              replace
            />
          }
        />

        <Route
          path="insurance-offer"
          element={<Home />}
        />

        <Route
          path="riskAssesment"
          element={<RiskAssesment />}
        />

        <Route
          path="insurances"
          element={<Insurances />}
        />

        <Route
          path="additional"
          element={<Additional />}
        />

        <Route
          path="*"
          element={
            <Navigate
              to="insurance-offer"
              replace
            />
          }
        />
      </Route>

      {/* Үндсэн зам */}
      <Route
        path="/"
        element={isLogged ? <Navigate to="/admin" replace /> : <Navigate to="/admin/login" replace />}
      />

      {/* Бусад зам */}
      <Route
        path="*"
        element={<Navigate to="/admin/login" replace />}
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
    
  );
}

export default App;
