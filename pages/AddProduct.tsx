import React, { useMemo, useState } from 'react';
import { ArrowLeft, ImagePlus, Save } from 'lucide-react';
import { StoreProduct } from '../types';

interface AddProductProps {
  onSubmitProduct: (product: Omit<StoreProduct, 'id'>) => void;
  onCancel: () => void;
}

const AddProduct: React.FC<AddProductProps> = ({ onSubmitProduct, onCancel }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const previewImage = uploadedImage || imageUrl.trim();
  const previewTitle = name.trim() || 'Product Name';
  const previewCategory = category.trim() || 'Category';
  const previewDescription = description.trim() || 'Short description will appear here.';
  const previewPrice = Number(price);
  const formattedPreviewPrice = useMemo(() => {
    if (!Number.isFinite(previewPrice) || previewPrice <= 0) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(previewPrice);
  }, [previewPrice]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileReader = new FileReader();
    fileReader.onload = () => {
      if (typeof fileReader.result === 'string') {
        setUploadedImage(fileReader.result);
        setImageUrl('');
      }
    };
    fileReader.readAsDataURL(file);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage('');

    const parsedPrice = Number(price);
    const resolvedImage = uploadedImage || imageUrl.trim();

    if (!name.trim() || !description.trim() || !category.trim()) {
      setErrorMessage('Please fill in product name, category, and description.');
      return;
    }

    if (!resolvedImage) {
      setErrorMessage('Please provide an image URL or upload a product image.');
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setErrorMessage('Please enter a valid price greater than zero.');
      return;
    }

    onSubmitProduct({
      name: name.trim(),
      price: parsedPrice,
      description: description.trim(),
      category: category.trim(),
      image: resolvedImage,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 text-igo-dark px-5 py-3 rounded-xl text-xs font-black uppercase tracking-[0.14em] hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back To Store
          </button>
        </div>

        <div className="grid xl:grid-cols-[1.2fr_0.8fr] gap-8 items-start">
          <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-black text-igo-dark tracking-tight mb-2">
                Add Product
              </h1>
              <p className="text-igo-muted">
                Create a new store item. It will appear immediately in your product cards.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-[0.14em] text-igo-muted mb-2">
                  Product Name
                </label>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  type="text"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-igo-lime/40 focus:border-igo-lime"
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black uppercase tracking-[0.14em] text-igo-muted mb-2">
                    Price
                  </label>
                  <input
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    type="number"
                    min="1"
                    step="1"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-igo-lime/40 focus:border-igo-lime"
                    placeholder="e.g. 1499"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-[0.14em] text-igo-muted mb-2">
                    Category
                  </label>
                  <input
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    type="text"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-igo-lime/40 focus:border-igo-lime"
                    placeholder="Indoor / Outdoor / Tools"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-[0.14em] text-igo-muted mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-igo-lime/40 focus:border-igo-lime"
                  placeholder="Write a short product description"
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black uppercase tracking-[0.14em] text-igo-muted mb-2">
                    Image URL
                  </label>
                  <input
                    value={imageUrl}
                    onChange={(event) => {
                      setImageUrl(event.target.value);
                      if (event.target.value.trim()) setUploadedImage('');
                    }}
                    type="url"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-igo-lime/40 focus:border-igo-lime"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-[0.14em] text-igo-muted mb-2">
                    Upload Image
                  </label>
                  <label className="w-full border border-dashed border-gray-300 rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer hover:border-igo-lime transition-colors">
                    <ImagePlus className="w-5 h-5 text-igo-muted" />
                    <span className="text-sm text-igo-muted">
                      {uploadedImage ? 'Image uploaded' : 'Choose file'}
                    </span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {errorMessage && (
                <p className="text-sm font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 w-full md:w-auto bg-igo-dark text-white px-7 py-3.5 rounded-xl text-xs font-black uppercase tracking-[0.14em] hover:bg-igo-charcoal transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Product
              </button>
            </form>
          </section>

          <aside className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-6 xl:sticky xl:top-8">
            <h2 className="text-sm font-black uppercase tracking-[0.14em] text-igo-muted mb-4">
              Live Preview
            </h2>
            <article className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
              <div className="h-52 bg-gray-100">
                {previewImage ? (
                  <img src={previewImage} alt={previewTitle} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-igo-muted text-sm font-semibold">
                    Image preview
                  </div>
                )}
              </div>
              <div className="p-5">
                <span className="inline-flex bg-igo-lime/10 text-igo-dark rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] mb-3">
                  {previewCategory}
                </span>
                <h3 className="text-xl font-black text-igo-dark leading-tight">{previewTitle}</h3>
                <p className="text-sm text-igo-muted mt-2">{previewDescription}</p>
                <div className="text-2xl font-black text-green-700 mt-4">{formattedPreviewPrice}</div>
              </div>
            </article>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
