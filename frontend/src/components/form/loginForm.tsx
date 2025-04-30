// src/components/LoginForm.tsx
import { useState, ChangeEvent, FormEvent } from "react";

// Define types for the state and props

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormProps {
  onSignupSuccess?: () => void; // Optional function that returns void
}

// Define a type for the expected API response structure
interface SignupApiResponse {
  success?: boolean; // success is optional based on the logic
  message?: string; // message is optional based on the logic
  // Add other potential fields if the API returns them, e.g., user data
}

function LoginForm({ onSignupSuccess }: LoginFormProps) {
  // Use defined props type
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>(""); // Explicitly type as string
  const [success, setSuccess] = useState<string>(""); // Explicitly type as string
  const [isLoading, setIsLoading] = useState<boolean>(false); // Explicitly type as boolean

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Type event
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    // Clear errors when user starts typing again
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    // Type event
    e.preventDefault(); // Prevent default browser form submission
    setError("");
    setSuccess("");
    setIsLoading(true);

    // --- Client-Side Validation ---
    if (!formData.email || !formData.password) {
      setError("All fields are required.");
      setIsLoading(false);
      return;
    }

    // Basic email format check (more robust checks can be added)
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }
    // Add password strength check if desired

    // --- Prepare data for API ---
    const dataToSend: LoginFormData = {
      email: formData.email,
      password: formData.password,
    };

    try {
      const response = await fetch("http://localhost:5001/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      const result: SignupApiResponse = await response.json();

      if (!response.ok) {
        setError(
          result?.message || `An error occurred: ${response.statusText}`
        );
      } else if (result?.success) {
        setSuccess(result?.message || "Signup successful!");
        setFormData({
          email: "",
          password: "",
        });
        if (onSignupSuccess) {
          onSignupSuccess();
        }
      } else {
        setError(result?.message || "Signup failed. Please try again.");
      }
    } catch (err) {
      console.error("Signup fetch error:", err);
      setError("Could not connect to the server. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card bg-base-100 w-full max-w-lg shrink-0 shadow-2xl mx-auto">
      <form className="card-body" onSubmit={handleSubmit} noValidate>
        <h2 className="card-title text-2xl mb-4">Sign Up</h2>

        {/* Error Message */}
        {error && (
          <div role="alert" className="alert alert-error mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2 2m2-2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Error! {error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div role="alert" className="alert alert-success mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{success}</span>
          </div>
        )}

        {/* Email */}
        <div className="form-control mt-4">
          <label className="label" htmlFor="email">
            <span className="label-text">Email</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="john.doe@example.com"
            className="input input-bordered"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        {/* Password */}
        <div className="form-control mt-4">
          <label className="label" htmlFor="password">
            <span className="label-text">Password</span>
          </label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="••••••••"
            className="input input-bordered"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        {/* Submit Button */}
        <div className="form-control mt-6">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              "Login"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;
