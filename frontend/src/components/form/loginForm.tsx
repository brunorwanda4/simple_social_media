// src/components/LoginForm.tsx
import { useState, ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";

// Define types for the state and props

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginProps {
  // Optional function to call after successful login
  onLoginSuccess?: (token: string, user: PublicUser) => void;
}

// Define the expected API response structure for a successful login
interface LoginApiResponseSuccess {
  success: true;
  message: string;
  token: string; // The JWT token from the backend
  user: PublicUser; // Public user data from the backend
}

// Define the expected API response structure for a failed login
interface LoginApiResponseError {
  success: false;
  message: string;
  // Optional: Add other error details if backend provides them
}

// Union type for the possible API responses
type LoginApiResponse = LoginApiResponseSuccess | LoginApiResponseError;

// Assuming you have a PublicUser interface defined somewhere,
// or you can define it here to match the backend response structure
interface PublicUser {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    created_at: string; // Or Date, depending on how your backend serializes it
}


function LoginForm({ onLoginSuccess }: LoginProps) {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    // Clear messages when user starts typing
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    // --- Client-Side Validation ---
    if (!formData.email || !formData.password) {
      setError("Email and password are required.");
      setIsLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    // --- Prepare data for API ---
    const dataToSend: LoginFormData = {
      email: formData.email,
      password: formData.password,
    };

    try {
      // --- API Call ---
      // Change the endpoint to /api/login
      const response = await fetch("http://localhost:5001/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      // Cast the JSON response to the union type
      const result: LoginApiResponse = await response.json();

      if (!response.ok) {
        // Handle HTTP errors (4xx, 5xx) or backend success: false
        // Use optional chaining ?. for safety, though the types define message
        setError(
          result.message || `Login failed with status: ${response.status}`
        );
      } else { // response.ok is true (status 200-299)
          // Based on our backend, response.ok should mean success: true
          const successResult = result as LoginApiResponseSuccess; // Cast for type safety after checking response.ok
          console.log("Login successful:", successResult);

          // --- Handle successful login ---
          setSuccess(successResult.message || "Login successful!");

          // Store the token in localStorage
          localStorage.setItem('authToken', successResult.token);

          // Optional: Store user info as well if needed elsewhere in the app
          localStorage.setItem('userInfo', JSON.stringify(successResult.user));

          // Call the success callback if provided
          if (onLoginSuccess) {
              onLoginSuccess(successResult.token, successResult.user);
          }

          // Clear the form or redirect the user (redirection is more common)
        //   setFormData({ email: "", password: "" });
        //   redirect(`/dashboard`)
          // Example Redirect:
          window.location.href = '/dashboard'; // Redirect to your dashboard route


      }
    } catch (err) {
      console.error("Login fetch error:", err);
      setError("Could not connect to the server. Please try again later.");
    } finally {
      setIsLoading(false); // Stop loading indicator
    }
  };

  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col items-center pt-10">
        <div className="card bg-base-100 w-full max-w-lg shrink-0 shadow-2xl mx-auto ">
      {/* Changed title and removed formnovalidate - use client-side validation */}
      <form className="card-body" onSubmit={handleSubmit}>
        <h2 className="card-title text-2xl mb-4 text-center">Login</h2>

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
        <div className="form-control mt-4 flex flex-col ">
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
              "Login" // Changed button text
            )}
          </button>
        </div>
      <Link to="/register" className="mr-4 text-blue-600 hover:underline">
        Create account
      </Link>
      </form>
    </div>
    </div>
  );
}

export default LoginForm;