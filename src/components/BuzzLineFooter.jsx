import logoLightBg from '../assets/logo_ligthbg.svg';
import logoDarkBg from '../assets/logo_darkbg.svg';

const BuzzLineFooter = () => (
  <footer className="flex flex-col border-t-2 border-primary w-[90%] py-12 mx-auto gap-12 text-primary">
    <div className="flex flex-col md:flex-row md:flex-wrap w-full items-center md:items-center gap-10">
      <div className="flex flex-col md:w-full lg:w-auto md:flex-row items-center md:justify-center gap-10 min-w-[220px] md:min-w-[320px] self-center">
        <img src={logoLightBg} className="w-40 min-w-[120px]"/>
        <img src={logoDarkBg} className="w-40 rounded-full min-w-[120px]"/>
      </div>
      <div className="flex flex-col md:flex-row items-center lg:items-start   gap-6 md:gap-x-20 mx-auto lg:mx-0 lg:flex-1 lg:justify-end ">
        <div className="flex flex-col items-center md:items-start min-w-[180px]">
          <p><span className="font-bold">Address:</span> National University - Manila</p>
          <p><span className="font-bold">E-mail:</span> buzzmap@gmail.com</p>
        </div>
        <div className="flex flex-col items-center md:items-start min-w-[180px]">
          <p>Terms of Service</p>
          <p>Privacy Policy</p>
          <p>Data Protection Policy</p>
        </div>
        <div className="font-bold italic text-lg text-center md:text-left min-w-[120px] lg:self-end">copyright 2025</div>
      </div>
    </div>
  </footer>
);

export default BuzzLineFooter; 