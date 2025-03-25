import { NavLink } from "react-router-dom";
import { navLinks } from "../utils";
import LogoNamed from "./LogoNamed";

const Navbar = () => {
  return (
    <nav className="flex justify-between pl-8 pr-10 py-6 items-center mb-12">
      <LogoNamed />
      <div className="font-body flex gap-x-6">
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
