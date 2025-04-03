const CustomFormInput = ({ label, placeholder }) => {
  return (
    <div className="flex flex-col gap-y-2 w-full">
      <label className="text-left font">{label}</label>
      <input
        type="text"
        className="bg-base-200 text-primary py-2.5 px-3.5 rounded-2xl focus:outline-none"
        placeholder={placeholder}
      />
    </div>
  );
};

export default CustomFormInput;
