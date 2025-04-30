const baseClass = `z-50 fixed top-0 left-0 right-0 flex justify-between items-center px-6 py-3 lg:px-12 transition-all duration-300 ${
  currentRoute === "/mapping"
    ? "bg-primary text-white" // If on the mapping route
    : scrolled
    ? "bg-white/90 backdrop-blur-sm shadow-sm"
    : "bg-transparent"
}`;

if (currentRoute === "/mapping") {
  return (
    <nav className={`${baseClass} bg-primary text-white`}>
      <div className="hover:scale-[1.05] transition-transform duration-200">
        <LogoNamed theme="dark" />
      </div>
      <div className="hidden md:flex items-center gap-x-8">
        {renderLinks()}
        {user.name !== "Guest" ? renderProfile(true) : renderLoginButton(true)}
      </div>
      <button
        className="md:hidden text-white transition-transform duration-200 hover:scale-110 active:scale-90"
        onClick={toggleDrawer}
      >
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 md:hidden z-40 transition-opacity duration-300">
          <div className="absolute top-0 left-0 w-full bg-primary px-6 py-6 flex flex-col gap-y-6 animate-slide-down">
            {renderLinks(true)}
            <div className="pt-4 w-full">
              {user.name !== "Guest"
                ? renderProfile(true, true)
                : renderLoginButton(true, true)}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} else if (/^\/mapping\/.+$/.test(currentRoute)) {
  return (
    <nav className="z-50 fixed right-6 top-6 text-white text-md bg-primary/90 backdrop-blur-sm py-3 px-6 rounded-2xl shadow-lg flex items-center gap-x-8 transition-all duration-300 hover:scale-[1.02]">
      {renderLinks()}
      {user.name !== "Guest" ? renderProfile(true) : renderLoginButton(true)}
    </nav>
  );
} else {
  return (
    <nav className={baseClass}>
      <div className="hover:scale-[1.05] transition-transform duration-200">
        <LogoNamed />
      </div>
      <div className="hidden md:flex items-center gap-x-8">
        {renderLinks()}
        {user.name !== "Guest" ? renderProfile() : renderLoginButton()}
      </div>
      <button
        className="md:hidden text-primary transition-transform duration-200 hover:scale-110 active:scale-90"
        onClick={toggleDrawer}
      >
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 md:hidden z-40 transition-opacity duration-300">
          <div className="absolute top-0 left-0 w-full bg-white/95 backdrop-blur-sm px-6 py-6 flex flex-col gap-y-6 animate-slide-down">
            {renderLinks(true)}
            <div className="pt-4 w-full">
              {user.name !== "Guest" ? renderProfile() : renderLoginButton()}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
