import { NavLink } from "react-router-dom";
import { navLinks } from "../utils";
import LogoNamed from "./LogoNamed";

const Navbar = () => {
  return (
    <nav className="font-body flex justify-between pl-8 pr-10 py-6 items-center">
      <LogoNamed />
      <div className="flex gap-x-6">
        {navLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.to}
            className={({ isActive }) =>
              isActive
                ? "text-accent font-semibold "
                : "text-primary font-semibold "
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
