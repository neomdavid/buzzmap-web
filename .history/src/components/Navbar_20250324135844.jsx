import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="flex justify-between px-8 py-6">
      <div>BUZZMAP</div>
      <div className="flex justify-between">
        <NavLink>Home</NavLink>
        <NavLink>Mapping</NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
