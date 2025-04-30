import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignupForm from "./components/form/SignupForm";
import "./index.css";
import UserList from "./components/components/UserList";
import LoginForm from "./components/form/loginForm";
import DashboardPage from "./pages/dashboard-page";

function App() {
  return (
    <div className="">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/register" element={<SignupForm />} />
          <Route path="/users" element={<UserList />} />
          <Route path="/dashboard/*" element={<DashboardPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
