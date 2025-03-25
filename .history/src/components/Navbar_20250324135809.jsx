import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="flex justify-between px-6 py-6">
      <div>BUZZMAP</div>
      <div>
        <NavLink>Home</NavLink>
        <NavLink>Mapping</NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
