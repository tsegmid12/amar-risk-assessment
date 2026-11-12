
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useParams,
  useLocation
} from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import {useEffect } from "react"

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
import Register from "./components/pages/admin/register";
import Verify from "./components/pages/admin/verify";
import EditInsurances from "./components/pages/admin/editInsurances";
import Products from "./components/pages/admin/products";
import ManageUsers from "./components/pages/admin/manageUser";
import ForgotPassword from "./components/pages/admin/forgotPassword";
import ForgotPasswordVerify from "./components/pages/admin/forgotPasswordVerify";
import ResetPassword from "./components/pages/admin/resetPassword";
import PriceOffer from "./components/pages/admin/priceOffer";
import AllPriceOffer from "./components/pages/admin/allPriceOffer";  
import AdditionalService from "./components/pages/admin/additionalService"; 

const ScrollToTop = () => {
 const { pathname } = useLocation();
 useEffect(() => {
   window.scrollTo(0, 0);
 }, [pathname]);
}

// ======================================
// ADMIN ROUTE PROTECTION
// ======================================
function ProtectedRoute() {

  useEffect(() => {
    const token = localStorage.getItem("token");

    const logout = () => {
      localStorage.removeItem("token");
      window.location.href = "/admin/login";
      window.alert("Таны нэвтрэх эрх дууссан байна. Дахин нэвтэрнэ үү.");
    };

    // Token байхгүй бол шууд logout
    if (!token) {
      logout();
      return;
    }

    try {
      const decodedToken = jwtDecode(token);

      const ms = decodedToken.exp * 1000 - Date.now();

      // Token хугацаа дууссан бол
      if (ms <= 0) {
        logout();
        return;
      }

      // Token дуусах үед автоматаар logout
      const timeout = setTimeout(logout, ms);

      return () => clearTimeout(timeout);

    } catch (error) {
      logout();
    }
  }, []);
  
  let user = null;

  try {
    user = jwtDecode(localStorage.getItem("token"));
    
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
      {/* ADMIN LOGIN - PUBLIC */}
      <Route path="/admin/login" element={<Login />}/>
      <Route path="/admin/register" element={<Register />} />
      <Route path="/admin/forgot-password" element={<ForgotPassword />} />
      <Route path="/admin/reset-password" element={<ResetPassword />} />
      <Route path="/admin/forgot-password-verify" element={<ForgotPasswordVerify />} />
      <Route path='/verify' element={<Verify />} />


      {/* ADMIN PAGES - PROTECTED */}
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

          <Route path="additional-services" element={<AdditionalService />} />

          <Route
            path="all-risk-assessment"
            element={<AllRiskAssessment />}
          />

          <Route path="price-offers" element={<PriceOffer />}/>

          <Route path="all-price-offers" element={<AllPriceOffer />}/>

          <Route path="update-assessment/:id" element={<UpdateAssessment />}
          />

          <Route path="edit-insurances/:id" element={<EditInsurances />}
          />

          <Route path="products" element={<Products />}
          />

          <Route path ="manage-users" element={<ManageUsers />} />

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
        element={<Navigate to={`/${id}/insurances`} replace />} 
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
      <ScrollToTop />
      <AppContent />
    </BrowserRouter>
    
  );
}

export default App;
