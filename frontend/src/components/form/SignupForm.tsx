// src/components/SignupForm.tsx
import { useState, ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";

// Define types for the state and props

interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface SignupFormProps {
  onSignupSuccess?: () => void; // Optional function that returns void
}

// Define a type for the expected API response structure
interface SignupApiResponse {
  success?: boolean; // success is optional based on the logic
  message?: string; // message is optional based on the logic
  // Add other potential fields if the API returns them, e.g., user data
}

function SignupForm({ onSignupSuccess }: SignupFormProps) {
  // Use defined props type
  const [formData, setFormData] = useState<SignupFormData>({
    // Use defined state type
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
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
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("All fields are required.");
      setIsLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }
    const dataToSend: SignupFormData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword, 
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
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
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
      setIsLoading(false); // Stop loading indicator
    }
  };

  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col items-center pt-10">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div className="form-control">
              <label className="label" htmlFor="firstName">
                <span className="label-text">First Name</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                placeholder="John"
                className="input input-bordered w-full"
                value={formData.firstName}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            {/* Last Name */}
            <div className="form-control flex flex-col">
              <label className="label" htmlFor="lastName">
                <span className="label-text">Last Name</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Doe"
                className="input input-bordered"
                value={formData.lastName}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-control mt-4 flex flex-col">
            <label className="label" htmlFor="email">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="john.doe@example.com"
              className="input input-bordered w-full"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          {/* Password */}
          <div className="form-control mt-4 flex flex-col">
            <label className="label" htmlFor="password">
              <span className="label-text">Password</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              className="input input-bordered w-full"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          {/* Confirm Password */}
          <div className="form-control mt-4 flex flex-col">
            <label className="label" htmlFor="confirmPassword">
              <span className="label-text">Confirm Password</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="••••••••"
              className="input input-bordered w-full"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          {/* Submit Button */}
          <div className="form-control mt-6">
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Sign Up"
              )}
            </button>
          </div>
          <Link to="/" className="mr-4 text-blue-600 hover:underline">
            Login
          </Link>
        </form>
      </div>
    </div>
  );
}

export default SignupForm;
