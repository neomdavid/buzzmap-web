import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="flex justify-between px-8 py-6">
      <div>BUZZMAP</div>
      <div className="flex gap-x-6">
        <NavLink>Home</NavLink>
        <NavLink>Mapping</NavLink>
        <NavLink>Community</NavLink>
        <NavLink>Prevention</NavLink>
        <NavLink>About</NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
