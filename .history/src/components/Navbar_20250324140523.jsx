import { NavLink } from "react-router-dom";
import { navLinks } from "../utils";
const Navbar = () => {
  return (
    <nav className="flex justify-between px-8 py-6">
      <div className="">BUZZMAP</div>
      <div className="flex gap-x-6">
        {navLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.to}
            className={({ isActive }) => {
              isActive ? "text-accent" : "text-primary";
            }}
          >
            {link.name}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
