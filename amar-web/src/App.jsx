import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/navbar/navbar";
import Home from "./components/pages/home";
import RiskAssesment from "./components/pages/riskAssesment";
import Insurances from "./components/pages/Insurances";
import Additional from "./components/pages/additional";
import Admin from "./components/pages/admin/admin";
import AddRisk from "./components/pages/admin/addRisk";
import AddInsurance from "./components/pages/admin/addInsurance";
import AllRiskAssessment from "./components/pages/admin/allRiskAssessments";
import AdminNavbar from "./components/navbar/adminNavbar";

function AppContent() {
  const location = useLocation();

  // Admin замууд дээр Navbar харагдахгүй
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminPage ? <Navbar /> : <AdminNavbar />}

      <Routes>
        <Route
          path="/"
          element={<Navigate to="/insurance-offer" replace />}
        />

        <Route path="/insurance-offer" element={<Home />} />
        <Route path="/riskAssesment" element={<RiskAssesment />} />
        <Route path="/insurances" element={<Insurances />} />
        <Route path="/additional" element={<Additional />} />

        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/insurances" element={<Insurances />} />
        <Route path="/admin/add-risk" element={<AddRisk />} />
        <Route path="/admin/add-insurance" element={<AddInsurance />} />
        <Route path="/admin/all-risk-assessment" element={<AllRiskAssessment />} />
      </Routes>
    </>
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