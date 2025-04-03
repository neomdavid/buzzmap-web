const CustomFormInput = ({ label, placeholder, type = "text" }) => {
  return (
    <div className="flex flex-col gap-y-2 w-full">
      <label className="text-left font">{label}</label>
      <input
        type={type}
        className="bg-base-200 font-bold text-black py-2.5 rounded-2xl focus:outline-none"
        placeholder={placeholder}
      />
    </div>
  );
};

export default CustomFormInput;
