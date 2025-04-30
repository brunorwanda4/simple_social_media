import React, { useState, useEffect } from 'react';
import { Category, Product } from '../libs/types';

// --- API Base URL ---
const API_BASE_URL = 'http://localhost:5001/api';


function ProductPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]); // Fetch categories for dropdown
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // State for Product Form
    const [newProductName, setNewProductName] = useState<string>('');
    const [newProductCategoryId, setNewProductCategoryId] = useState<string>(''); // Use string for input value (for select)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editingProductCategoryId, setEditingProductCategoryId] = useState<string>(''); // Use string for input value (for select)


    // --- Fetch Data on Component Mount ---
    useEffect(() => {
        fetchProducts();
        fetchCategoriesForDropdown(); // Fetch categories for the product form dropdown
    }, []); // Empty dependency array means this runs once on mount

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/products`);
             if (!response.ok) {
                throw new Error(`Failed to fetch products: ${response.statusText}`);
            }
            const data = await response.json();
            if (data.success) {
                setProducts(data.products);
            } else {
                 throw new Error(data.message || 'Failed to fetch products');
            }
        } catch (err: any) {
            console.error('Error fetching products:', err);
            setError(`Error loading products: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

     const fetchCategoriesForDropdown = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/categories`);
            if (!response.ok) {
                throw new Error(`Failed to fetch categories for dropdown: ${response.statusText}`);
            }
            const data = await response.json();
            if (data.success) {
                setCategories(data.categories);
            } else {
                console.error('Failed to fetch categories for dropdown:', data.message);
                // Don't set a major error, just log it, as products can exist without categories
            }
        } catch (err: any) {
            console.error('Error fetching categories for dropdown:', err);
             // Don't set a major error, just log it
        }
     };


    // --- Product CRUD Operations ---

     const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProductName.trim()) {
             setError('Product name is required.');
             return;
        }

        // Convert categoryId string to number or null
        const categoryId = newProductCategoryId === '' ? null : parseInt(newProductCategoryId, 10);

        // Basic validation for categoryId if provided
        if (categoryId !== null && isNaN(categoryId)) {
             setError('Invalid category ID.');
             return;
        }


        try {
            const response = await fetch(`${API_BASE_URL}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add Authorization header here
                    // 'Authorization': `Bearer ${yourAuthToken}`
                },
                body: JSON.stringify({ name: newProductName, categoryId: categoryId }),
            });

            const data = await response.json();

            if (data.success) {
                console.log('Product created:', data.product);
                setNewProductName(''); // Clear form
                setNewProductCategoryId(''); // Clear category input
                fetchProducts(); // Refresh data
            } else {
                setError(data.message || 'Failed to create product');
            }
        } catch (err: any) {
            console.error('Error creating product:', err);
            setError(`Error creating product: ${err.message}`);
        }
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setNewProductName(product.name); // Populate form with current name
        // Populate category ID, handle null
        setEditingProductCategoryId(product.category_id === null ? '' : product.category_id.toString());
    };

    const handleUpdateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct || (!newProductName.trim() && editingProductCategoryId === undefined)) {
             setError('Provide product name or category for update.');
             return;
        }

         // Convert categoryId string to number or null
        const categoryId = editingProductCategoryId === '' ? null : parseInt(editingProductCategoryId, 10);

        // Basic validation for categoryId if provided
        if (editingProductCategoryId !== '' && categoryId !== null && isNaN(categoryId)) {
             setError('Invalid category ID.');
             return;
        }


        try {
            const response = await fetch(`${API_BASE_URL}/products/${editingProduct.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                     // Add Authorization header here
                    // 'Authorization': `Bearer ${yourAuthToken}`
                },
                 // Only include fields that are being updated
                body: JSON.stringify({
                    ...(newProductName.trim() && { name: newProductName }),
                    ...(editingProductCategoryId !== undefined && { categoryId: categoryId }) // Send categoryId even if null
                }),
            });

             const data = await response.json();

            if (data.success) {
                console.log('Product updated:', data.product);
                setEditingProduct(null); // Exit editing mode
                setNewProductName(''); // Clear form
                setEditingProductCategoryId(''); // Clear category input
                fetchProducts(); // Refresh data
            } else {
                 setError(data.message || 'Failed to update product');
            }
        } catch (err: any) {
            console.error('Error updating product:', err);
            setError(`Error updating product: ${err.message}`);
        }
    };

    const handleDeleteProduct = async (productId: number) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
                method: 'DELETE',
                headers: {
                     // Add Authorization header here
                    // 'Authorization': `Bearer ${yourAuthToken}`
                },
            });

            const data = await response.json();

            if (data.success) {
                console.log('Product deleted:', productId);
                fetchProducts(); // Refresh data
            } else {
                 setError(data.message || 'Failed to delete product');
            }
        } catch (err: any) {
            console.error('Error deleting product:', err);
            setError(`Error deleting product: ${err.message}`);
        }
    };

    const handleCancelEditProduct = () => {
        setEditingProduct(null);
        setNewProductName('');
        setEditingProductCategoryId('');
    };


    // --- Render UI ---
    return (
        <div className="p-4"> 
            <h1 className="text-3xl font-bold mb-6 text-center">Product Management</h1>

            {loading && <div className="flex justify-center"><span className="loading loading-spinner loading-lg text-primary"></span></div>} {/* DaisyUI loading spinner */}
            {error && <div role="alert" className="alert alert-error mb-4"> {/* DaisyUI alert */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>Error: {error}</span>
                    </div>}

            {/* Product Form (Create/Edit) */}
             <div className="card bg-base-100 shadow-xl mb-8"> {/* DaisyUI card */}
                <div className="card-body">
                    <h2 className="card-title text-2xl mb-4">{editingProduct ? 'Edit Product' : 'Create New Product'}</h2>
                     <form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct} className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="text"
                            placeholder="Product Name"
                            value={newProductName}
                            onChange={(e) => setNewProductName(e.target.value)}
                             className="input input-bordered w-full" // DaisyUI input
                        />
                        {/* Category Select Dropdown */}
                        <select
                            value={editingProduct ? editingProductCategoryId : newProductCategoryId}
                            onChange={(e) => editingProduct ? setEditingProductCategoryId(e.target.value) : setNewProductCategoryId(e.target.value)}
                            className="select select-bordered w-full max-w-xs" // DaisyUI select
                        >
                            <option value="">-- Select Category (Optional) --</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>


                        {editingProduct ? (
                             <>
                                <button type="submit" className="btn btn-success"> {/* DaisyUI button */}
                                    Update Product
                                </button>
                                 <button type="button" onClick={handleCancelEditProduct} className="btn btn-ghost"> {/* DaisyUI button */}
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button type="submit" className="btn btn-primary"> {/* DaisyUI button */}
                                Add Product
                            </button>
                        )}
                    </form>
                </div>
            </div>


            {/* Product List */}
            <div className="card bg-base-100 shadow-xl"> {/* DaisyUI card */}
                <div className="card-body">
                    <h2 className="card-title text-2xl mb-4">Product List</h2>
                    <div className="overflow-x-auto"> {/* DaisyUI table container */}
                        <table className="table w-full"> {/* DaisyUI table */}
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Created At</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.id}>
                                        <td>{product.id}</td>
                                    <td>{product.name}</td>
                                    <td>{product.category_name || 'N/A'}</td> {/* Display category name or 'N/A' */}
                                    <td>{new Date(product.created_at).toLocaleString()}</td>
                                        <td>
                                            <button onClick={() => handleEditProduct(product)} className="btn btn-warning btn-sm mr-2"> {/* DaisyUI button */}
                                                Edit
                                            </button>
                                            <button onClick={() => handleDeleteProduct(product.id)} className="btn btn-error btn-sm"> {/* DaisyUI button */}
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductPage;
