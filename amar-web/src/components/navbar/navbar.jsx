
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "../../assets/logo.svg";
import fb from "../../assets/fb.png";
import ig from "../../assets/ig.png";

function Navbar() {
    const [active, setActive] = useState(1);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.pathname === "/insurance-offer") {
            setActive(1);
        } else if (location.pathname === "/riskAssesment") {
            setActive(2);
        } else if (location.pathname === "/additional") {
            setActive(3);
        } else if (location.pathname === "/insurances") {
            setActive(4);
        }
    }, [location.pathname]);    
  return (
    <nav className="mx-auto w-[98%] border mt-2 rounded-2xl shadow-xl border-gray-200 bg-white">
        <div className='flex items-center justify-between py-4 px-10'>
            <img src={logo} alt="Logo" className="h-10 w-auto" />
            <ul className="flex items-center space-x-2 text-gray-600 font-semibold rounded-full bg-gray-100 px-2 py-1">
                <li onClick={() => {setActive(1); navigate("/insurance-offer")}}
                    className={active === 1? "text-white bg-red-500 px-2 py-1.5 rounded-full font-medium" : "hover:text-red-500 hover:bg-gray-200 hover:rounded-2xl duration-300 px-2 py-1.5 cursor-pointer"}>Даатгалын санал</li>
                <li onClick={() => {setActive(2); navigate("/riskAssesment")}}
                    className={active === 2? "text-white bg-red-500 px-2 py-1.5 rounded-full font-medium" : "hover:text-red-500  hover:bg-gray-200 hover:rounded-2xl duration-300 px-2 py-1.5 cursor-pointer"}>Эрсдэлийн үнэлгээ</li>
                <li onClick={() => {setActive(3); navigate("/additional")}}
                    className={active === 3? "text-white bg-red-500 px-2 py-1.5 rounded-full font-medium" : "hover:text-red-500 hover:bg-gray-200 hover:rounded-2xl duration-300 px-2 py-1.5 cursor-pointer"}>Нэмэлт үйлчилгээ</li>
                <li onClick={() => {setActive(4); navigate("/insurances")}} 
                    className={active === 4? "text-white bg-red-500 px-2 py-1.5 rounded-full font-medium" : "hover:text-red-500 hover:bg-gray-200 hover:rounded-2xl duration-300 px-2 py-1.5 cursor-pointer"}>бүх даатгал</li>
            </ul>
            <div className="flex space-x-14">
                <img src={ig} alt="Instagram" className="h-6 w-auto" />
                <img src={fb} alt="Facebook" className="h-6 w-auto" />
            </div>
           
        </div>
    </nav>
  );
}

export default Navbar;

