import { BrowserRouter, Routes, Route, Link } from "react-router-dom"; 
import SignupForm from "./components/SignupForm";
import "./index.css";
import UserList from "./components/components/UserList";

function App() {
  return (
    // Wrap your content that uses routing within BrowserRouter
    <div className="container mx-auto p-4 min-h-screen flex flex-col items-center pt-10">
      <h1 className="text-3xl font-bold mb-8">Social App</h1>{" "}
      {/* Updated title */}
      <BrowserRouter>
        {/* Optional: Add navigation links */}
        <nav className="mb-4">
          <Link to="/" className="mr-4 text-blue-600 hover:underline">
            Signup
          </Link>
          <Link to="/users" className="text-blue-600 hover:underline">
            Users
          </Link>
        </nav>
        <Routes>
          <Route path="/" element={<SignupForm />} />
          <Route path="/users" element={<UserList />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
