import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="flex">
      <div>BUZZMAP</div>
      <div>
        <NavLink>Home</NavLink>
        <NavLink>Mapping</NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
