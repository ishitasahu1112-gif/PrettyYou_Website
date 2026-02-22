import { useState, useEffect } from 'react';
import { ref, push, set, update } from 'firebase/database';
import { db } from '../../services/firebase';

const ProductForm = ({ product, onClose, onSaved }) => {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: '',
        description: '',
        material: '',
        weight: '',
        dimensions: '',
        image: '',
    });
    const [loading, setLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [uploadError, setUploadError] = useState(null);

    useEffect(() => {
        if (product) {
            setFormData(product);
        }
    }, [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            // Ensure price is handled as a number
            [name]: name === 'price' ? Number(value) : value
        }));
    };

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setImageFile(e.target.files[0]);
            setUploadError(null);
        }
    };

    const compressImageToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const MAX_DIMENSION = 800;

                    if (width > height) {
                        if (width > MAX_DIMENSION) {
                            height *= MAX_DIMENSION / width;
                            width = MAX_DIMENSION;
                        }
                    } else {
                        if (height > MAX_DIMENSION) {
                            width *= MAX_DIMENSION / height;
                            height = MAX_DIMENSION;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG with 0.7 quality to keep size small for Firestore
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    resolve(dataUrl);
                };
                img.onerror = error => reject(error);
            };
            reader.onerror = error => reject(error);
        });
    };

    const handleGenerateDescription = async () => {
        if (!formData.name || !imageFile) {
            setUploadError("Product Name and Product Image are required to generate a description.");
            return;
        }

        setIsGenerating(true);
        setUploadError(null);

        try {
            const base64Image = await compressImageToBase64(imageFile);
            const base64Data = base64Image.split(',')[1]; // Extract just the base64 data

            const payload = {
                system_prompt: "You are an expert luxury jewelry copywriter. Write a short, engaging, and elegant product description consisting of 2-3 sentences max. Focus on the aesthetic appeal, material, and suitable occasions.",
                user_prompt: `Write a product description for an item named "${formData.name}" in the "${formData.category || 'General'}" category.`,
                image: base64Data
            };

            const response = await fetch('https://ishita2000.app.n8n.cloud/webhook-test/61460c1d-6202-4fc5-91df-ad8e04068ccb', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            // Handle n8n response format
            let generatedDescription = "";
            if (data && data[0] && data[0].output) {
                generatedDescription = data[0].output;
            } else if (data && data.output) {
                generatedDescription = data.output;
            } else if (data && data[0] && data[0].body && data[0].body.output) {
                // deep n8n standard path
                generatedDescription = data[0].body.output;
            } else {
                console.log("Unexpected response structure:", data);
                throw new Error("Could not parse generated text from response.");
            }

            setFormData(prev => ({ ...prev, description: generatedDescription.trim() }));
        } catch (error) {
            console.warn("Error generating description from n8n webhook:", error);
            console.log("Falling back to simulated AI response for demonstration...");

            // Fallback for demonstration when webhook is down
            setTimeout(() => {
                const dummyDescription = `Elevate your look with the stunning ${formData.name}. Expertly crafted from high-quality ${formData.material || 'materials'}, this ${formData.category || 'beautiful piece'} offers a perfect blend of modern elegance and timeless design. Ideal for both everyday wear and special occasions.`;
                setFormData(prev => ({ ...prev, description: dummyDescription }));
                setUploadError("Note: Using simulation mode. Webhook connection failed.");
                setIsGenerating(false);
            }, 1500);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setUploadError(null);

        try {
            let imageUrl = formData.image;

            if (imageFile) {
                imageUrl = await compressImageToBase64(imageFile);
            }

            const dataToSave = { ...formData, image: imageUrl };

            if (product && product.id) {
                // Update existing product
                await update(ref(db, `products/${product.id}`), dataToSave);
            } else {
                // Add new product
                const newProductRef = push(ref(db, 'products'));
                await set(newProductRef, dataToSave);
            }
            onSaved();
        } catch (error) {
            console.error("Error saving product: ", error);
            setUploadError("Failed to save product. Check your connection or database rules.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#4A3B32]/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-[#E8E1D9] sticky top-0 bg-white">
                    <h2 className="text-2xl font-serif text-[#4A3B32]">
                        {product ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <button onClick={onClose} className="text-[#8C7A6B] hover:text-[#4A3B32] transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-[#4A3B32] mb-1">Name</label>
                            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border border-[#E8E1D9] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4A3B32]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#4A3B32] mb-1">Price ($)</label>
                            <input required type="number" name="price" value={formData.price} onChange={handleChange} min="0" step="0.01" className="w-full border border-[#E8E1D9] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4A3B32]" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-[#4A3B32] mb-1">Category</label>
                            <input required type="text" name="category" value={formData.category} onChange={handleChange} placeholder="e.g. Gold Plated, Silver" className="w-full border border-[#E8E1D9] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4A3B32]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#4A3B32] mb-1">Product Image</label>
                            <div className="flex items-center gap-4">
                                <div className="flex-grow">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="w-full text-sm text-[#8C7A6B] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#F5F1EB] file:text-[#4A3B32] hover:file:bg-[#E8E1D9] focus:outline-none cursor-pointer"
                                    />
                                </div>
                                {(formData.image || imageFile) && (
                                    <div className="h-10 w-10 flex-shrink-0 bg-[#F5F1EB] rounded-md overflow-hidden border border-[#E8E1D9]">
                                        <img
                                            src={imageFile ? URL.createObjectURL(imageFile) : formData.image}
                                            alt="Preview"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-[#4A3B32]">Description</label>
                            <button
                                type="button"
                                onClick={handleGenerateDescription}
                                disabled={isGenerating || !formData.name || !imageFile}
                                className="text-xs font-semibold bg-[#F5F1EB] hover:bg-[#E8E1D9] text-[#4A3B32] transition-colors px-3 py-1 rounded-full flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGenerating ? (
                                    <>
                                        <svg className="animate-spin h-3 w-3 text-[#4A3B32]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Generating...
                                    </>
                                ) : (
                                    <>✨ Auto-Generate with AI</>
                                )}
                            </button>
                        </div>
                        <textarea required name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full border border-[#E8E1D9] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4A3B32]"></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-[#4A3B32] mb-1">Material</label>
                            <input required type="text" name="material" value={formData.material} onChange={handleChange} className="w-full border border-[#E8E1D9] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4A3B32]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#4A3B32] mb-1">Weight</label>
                            <input type="text" name="weight" value={formData.weight} onChange={handleChange} placeholder="e.g. 4g" className="w-full border border-[#E8E1D9] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4A3B32]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#4A3B32] mb-1">Dimensions</label>
                            <input type="text" name="dimensions" value={formData.dimensions} onChange={handleChange} placeholder="e.g. 2.5cm x 1cm" className="w-full border border-[#E8E1D9] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4A3B32]" />
                        </div>
                    </div>

                    {uploadError && (
                        <div className="text-red-500 text-sm mt-2">{uploadError}</div>
                    )}

                    <div className="pt-4 border-t border-[#E8E1D9] flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-5 py-2 text-[#4A3B32] hover:bg-[#F5F1EB] rounded-md text-sm font-medium transition-colors cursor-pointer">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="px-5 py-2 bg-[#4A3B32] hover:bg-[#3A2B22] text-white rounded-md text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2">
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : 'Save Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductForm;
