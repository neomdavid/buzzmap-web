import { NavLink } from "react-router-dom";
import { navLinks } from "../utils";

const Navbar = () => {
  return (
    <nav className="flex justify-between pl-6 pr-10 py-6">
      <div className="font-title text-2xl">BUZZMAP</div>
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
