import { useState } from "react";
import { useLoginMutation } from "../../api/dengueApi"; // Import the useLoginMutation hook
import { CustomFormInput } from "../../components"; // Import the CustomFormInput

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [login, { isLoading, isError, error: apiError }] = useLoginMutation();

  const validateInput = (inputValue, type) => {
    if (type === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(inputValue)) {
        setError("Invalid email format.");
      } else {
        setError("");
      }
    } else if (type === "password") {
      const minLength = 8;
      const maxLength = 64;
      const containsLetter = /[a-zA-Z]/.test(inputValue);
      const containsNumber = /\d/.test(inputValue);
      const containsSpecialChar = /[@$!%*?&]/.test(inputValue);

      if (inputValue.length < minLength) {
        setError("Password must be at least 8 characters long.");
      } else if (inputValue.length > maxLength) {
        setError("Password must not exceed 64 characters.");
      } else if (commonPasswords.includes(inputValue.toLowerCase())) {
        setError("This password is too common. Choose a stronger one.");
      } else if (!containsLetter || !containsNumber || !containsSpecialChar) {
        setError(
          "Password must contain at least one letter, one number, and one special character (!, @, #, $)."
        );
      } else {
        setError("");
      }
    } else {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password }).unwrap();
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <main className="flex justify-center items-center">
      <form onSubmit={handleSubmit}>
        <CustomFormInput
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          error={error}
          validateInput={(val) => validateInput(val, "email")}
        />
        <CustomFormInput
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          error={error}
          validateInput={(val) => validateInput(val, "password")}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>
        {isError && (
          <p>{apiError?.message || "An error occurred. Please try again."}</p>
        )}
      </form>
    </main>
  );
};

export default Login;
