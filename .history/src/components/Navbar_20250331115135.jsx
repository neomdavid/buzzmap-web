import { NavLink, useLocation } from "react-router-dom";
import { navLinks } from "../utils";
import LogoNamed from "./LogoNamed";

const Navbar = () => {
  const currentRoute = useLocation().pathname;

  return currentRoute !== "/mapping" ? (
    <nav className="z-100000 flex bg-white fixed top-0 left-0 right-0 shadow-sm justify-between pl-8 pr-10 py-6 items-center  lg:text-lg">
      <LogoNamed />
      <div className=" flex gap-x-6">
        {navLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.to}
            className={({ isActive }) =>
              isActive ? "text-accent font-bold " : "text-primary font-bold "
            }
          >
            {link.name}
          </NavLink>
        ))}
      </div>
    </nav>
  ) : (
    <nav className="z-100000 flex bg-primary text-white fixed top-0 left-0 right-0 shadow-sm justify-between pl-8 pr-10 py-6 items-center  lg:text-lg">
      <LogoNamed />
      <div className=" flex gap-x-6">
        {navLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.to}
            className={({ isActive }) =>
              isActive ? "text-secondary font-bold " : "text-white font-bold "
            }
          >
            {link.name}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
