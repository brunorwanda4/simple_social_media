import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
// Define interfaces for your data
interface Category {
  id: number;
  name: string;
}
const simulatedCategories: Category[] = [
  { id: 1, name: "Electronics" },
  { id: 2, name: "Books" },
  { id: 3, name: "Clothing" },
  { id: 4, name: "Home Goods" },
];

interface Product {
  id: number;
  name: string;
  quantityIn: number;
  category: string; // Storing category name as string for simplicity
}
const initialProducts: Product[] = [];
const AddProduct: React.FC = () => {
  // State for form inputs with type annotations
  const [productName, setProductName] = useState<string>("");
  const [quantityIn, setQuantityIn] = useState<string>(""); // Keep as string for input value
  const [category, setCategory] = useState<string>("");
  const [message, setMessage] = useState<string>(""); // State for success/error messages

  // State for products, loaded from localStorage or initial state
  const [products, setProducts] = useState<Product[]>(() => {
    const savedProducts = localStorage.getItem("products");
    try {
      return savedProducts ? JSON.parse(savedProducts) : initialProducts;
    } catch (error) {
      console.error("Failed to parse products from localStorage:", error);
      return initialProducts; // Return initial state if parsing fails
    }
  });

  // Effect to save products to localStorage whenever the products state changes
  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  // Handle form submission with FormEvent type
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Basic validation
    if (!productName || !quantityIn || !category) {
      setMessage("Please fill in all fields.");
      return;
    }

    // Convert quantityIn to a number, handle potential NaN
    const quantity = parseInt(quantityIn, 10);
    if (isNaN(quantity)) {
      setMessage("Quantity must be a valid number.");
      return;
    }

    // Create a new product object
    const newProduct: Product = {
      id: Date.now(), // Simple unique ID
      name: productName,
      quantityIn: quantity,
      category: category,
    };

    // Add the new product to the products state
    setProducts([...products, newProduct]);

    // Clear the form and show success message
    setProductName("");
    setQuantityIn("");
    setCategory("");
    setMessage("Product added successfully!");

    // Clear the message after a few seconds
    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">
        Add New Product
      </h2>
      {message && (
        <div
          className={`mb-4 p-3 rounded ${
            message.includes("successfully")
              ? "bg-green-200 text-green-800"
              : "bg-red-200 text-red-800"
          }`}
        >
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="productName"
            className="block text-sm font-medium text-gray-700"
          >
            Product Name
          </label>
          <input
            type="text"
            id="productName"
            value={productName}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setProductName(e.target.value)
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
            required
          />
        </div>
        <div>
          <label
            htmlFor="quantityIn"
            className="block text-sm font-medium text-gray-700"
          >
            Quantity In
          </label>
          <input
            type="number"
            id="quantityIn"
            value={quantityIn}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setQuantityIn(e.target.value)
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
            required
          />
        </div>
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700"
          >
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setCategory(e.target.value)
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
            required
          >
            <option value="">-- Select Category --</option>
            {simulatedCategories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
