const CustomFormInput = ({
  label,
  type,
  value,
  onChange,
  isConfirm,
  theme,
}) => {
  return (
    <div className="form-input">
      <label className="block text-sm font-semibold">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={`input ${theme === "light" ? "input-light" : "input-dark"}`}
        aria-describedby={`${label}-helper`}
        id={label}
      />
      {isConfirm && (
        <span id={`${label}-helper`} className="text-xs text-gray-500">
          Confirm your {label}
        </span>
      )}
    </div>
  );
};

export default CustomFormInput;
