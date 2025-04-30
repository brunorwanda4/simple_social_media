import React, { useState, useEffect } from 'react'
import { Category } from '../libs/types';

// --- API Base URL ---
const API_BASE_URL = 'http://localhost:5001/api';


function CategoryPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // State for Category Form
    const [newCategoryName, setNewCategoryName] = useState<string>('');
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // --- Fetch Categories on Component Mount ---
    useEffect(() => {
        fetchCategories();
    }, []); // Empty dependency array means this runs once on mount

    const fetchCategories = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/categories`);
            if (!response.ok) {
                throw new Error(`Failed to fetch categories: ${response.statusText}`);
            }
            const data = await response.json();
            if (data.success) {
                setCategories(data.categories);
            } else {
                throw new Error(data.message || 'Failed to fetch categories');
            }
        } catch (err: any) {
            console.error('Error fetching categories:', err);
            setError(`Error loading categories: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // --- Category CRUD Operations ---

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        try {
            const response = await fetch(`${API_BASE_URL}/categories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add Authorization header here if your API requires it
                    // 'Authorization': `Bearer ${yourAuthToken}`
                },
                body: JSON.stringify({ name: newCategoryName }),
            });

            const data = await response.json();

            if (data.success) {
                console.log('Category created:', data.category);
                setNewCategoryName(''); // Clear form
                fetchCategories(); // Refresh data
            } else {
                setError(data.message || 'Failed to create category');
            }
        } catch (err: any) {
            console.error('Error creating category:', err);
            setError(`Error creating category: ${err.message}`);
        }
    };

    const handleEditCategory = (category: Category) => {
        setEditingCategory(category);
        setNewCategoryName(category.name); // Populate form with current name
    };

    const handleUpdateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory || !newCategoryName.trim()) return;

        try {
            const response = await fetch(`${API_BASE_URL}/categories/${editingCategory.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                     // Add Authorization header here
                    // 'Authorization': `Bearer ${yourAuthToken}`
                },
                body: JSON.stringify({ name: newCategoryName }),
            });

             const data = await response.json();

            if (data.success) {
                console.log('Category updated:', data.category);
                setEditingCategory(null); // Exit editing mode
                setNewCategoryName(''); // Clear form
                fetchCategories(); // Refresh data
            } else {
                 setError(data.message || 'Failed to update category');
            }
        } catch (err: any) {
            console.error('Error updating category:', err);
            setError(`Error updating category: ${err.message}`);
        }
    };

    const handleDeleteCategory = async (categoryId: number) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
                method: 'DELETE',
                headers: {
                     // Add Authorization header here
                    // 'Authorization': `Bearer ${yourAuthToken}`
                },
            });

            const data = await response.json();

            if (data.success) {
                console.log('Category deleted:', categoryId);
                fetchCategories(); // Refresh data
            } else {
                 setError(data.message || 'Failed to delete category');
            }
        } catch (err: any) {
            console.error('Error deleting category:', err);
            setError(`Error deleting category: ${err.message}`);
        }
    };

     const handleCancelEditCategory = () => {
        setEditingCategory(null);
        setNewCategoryName('');
    };


    // --- Render UI ---
    return (
        <div className="p-4"> {/* Added padding */}
            <h1 className="text-3xl font-bold mb-6 text-center">Category Management</h1>

            {loading && <div className="flex justify-center"><span className="loading loading-spinner loading-lg text-primary"></span></div>} {/* DaisyUI loading spinner */}
            {error && <div role="alert" className="alert alert-error mb-4"> {/* DaisyUI alert */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>Error: {error}</span>
                    </div>}

            {/* Category Form (Create/Edit) */}
            <div className="card bg-base-100 shadow-xl mb-8"> {/* DaisyUI card */}
                <div className="card-body">
                    <h2 className="card-title text-2xl mb-4">{editingCategory ? 'Edit Category' : 'Create New Category'}</h2>
                    <form onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory} className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="text"
                            placeholder="Category Name"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            className="input input-bordered w-full" // DaisyUI input
                        />
                        {editingCategory ? (
                            <>
                                <button type="submit" className="btn btn-success"> {/* DaisyUI button */}
                                    Update Category
                                </button>
                                <button type="button" onClick={handleCancelEditCategory} className="btn btn-ghost"> {/* DaisyUI button */}
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button type="submit" className="btn btn-primary"> {/* DaisyUI button */}
                                Add Category
                            </button>
                        )}
                    </form>
                </div>
            </div>


            {/* Category List */}
             <div className="card bg-base-100 shadow-xl"> {/* DaisyUI card */}
                <div className="card-body">
                    <h2 className="card-title text-2xl mb-4">Category List</h2>
                    <div className="overflow-x-auto"> {/* DaisyUI table container */}
                        <table className="table w-full"> {/* DaisyUI table */}
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Created At</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((category) => (
                                    <tr key={category.id}>
                                        <td>{category.id}</td>
                                        <td>{category.name}</td>
                                        <td>{new Date(category.created_at).toLocaleString()}</td>
                                        <td>
                                            <button onClick={() => handleEditCategory(category)} className="btn btn-warning btn-sm mr-2"> {/* DaisyUI button */}
                                                Edit
                                            </button>
                                            <button onClick={() => handleDeleteCategory(category.id)} className="btn btn-error btn-sm"> {/* DaisyUI button */}
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

export default CategoryPage;
