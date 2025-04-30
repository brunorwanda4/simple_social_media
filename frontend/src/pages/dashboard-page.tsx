import { Route, Routes, Link, Navigate } from "react-router-dom";
import AddProduct from "../components/form/add-product-form";
import CategoryPage from "./CategoryPage";
import ProductPage from "./ProductPage";

// Component for the main Dashboard layout
const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Product Dashboard
      </h1>
      <nav className="mb-8">
        <ul className="flex justify-center space-x-6">
          <li>
            <Link
              to="/dashboard/products"
              className="text-blue-600 hover:underline text-lg"
            >
              Add Product
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/categories"
              className="text-blue-600 hover:underline text-lg"
            >
              categories
            </Link>
          </li>
        </ul>
      </nav>

      {/* This is where the routed components will render */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <Routes>
          {/* Redirect from /dashboard to /dashboard/view-products by default */}
          <Route path="/" element={<Navigate to="products" replace />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/categories" element={<CategoryPage />} />
          <Route path="products" element={<ProductPage />} />
        </Routes>
      </div>
    </div>
  );
};

export default DashboardPage;
