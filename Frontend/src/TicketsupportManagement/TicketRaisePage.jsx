import React, { useState, useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FiPlusCircle } from "react-icons/fi";

// Handmade categories and products
const PRODUCT_CATEGORIES = [
  "Jewelry",
  "Pottery",
  "Woodwork",
  "Textiles",
  "Glass Art",
  "Leather Goods",
  "Home Decor",
  "Painting",
  "Sculpture",
  "Paper Craft",
  "Candle Making",
  "Soap Making",
];

const PRODUCTS = {
  Jewelry: ["Necklace", "Bracelet", "Earrings", "Ring", "Brooch"],
  Pottery: ["Vase", "Mug", "Plate", "Bowl", "Planter"],
  Woodwork: ["Cutting Board", "Spoon", "Box", "Frame", "Toy"],
  Textiles: ["Scarf", "Bag", "Pillow", "Blanket", "Apron"],
  "Glass Art": ["Stained Glass", "Glass Vase", "Glass Jewelry", "Ornament"],
  "Leather Goods": ["Wallet", "Belt", "Bag", "Keychain", "Bracelet"],
  "Home Decor": ["Wall Art", "Lamp", "Clock", "Mirror", "Candle Holder"],
  Painting: ["Canvas", "Portrait", "Landscape", "Abstract", "Miniature"],
  Sculpture: ["Clay Figure", "Metal Art", "Stone Carving", "Wood Sculpture"],
  "Paper Craft": ["Card", "Origami", "Scrapbook", "Gift Box", "Banner"],
  "Candle Making": ["Scented Candle", "Decorative Candle", "Soy Candle"],
  "Soap Making": ["Herbal Soap", "Glycerin Soap", "Goat Milk Soap"],
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const TicketRaisePage = () => {
  const { token, backendUrl } = useContext(ShopContext);
  const [form, setForm] = useState({
    productCategory: "",
    product: "",
    subject: "",
    inquiry: "",
    image: null,
  });
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();

  // Handle dropdowns and text fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "productCategory") {
      setForm({
        ...form,
        productCategory: value,
        product: "", // Reset product on category change
      });
    } else {
      setForm({
        ...form,
        [name]: value,
      });
    }
  };

  // Handle file input
  const handleFile = (file) => {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      toast.error("Only PNG and JPG images are allowed.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image must be less than 5MB.");
      return;
    }
    setForm((prev) => ({ ...prev, image: file }));
    setPreview(URL.createObjectURL(file));
  };

  // Remove image
  const removeImage = () => {
    setForm((prev) => ({ ...prev, image: null }));
    setPreview(null);
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleImageInput = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.productCategory ||
      !form.product ||
      !form.subject ||
      !form.inquiry
    ) {
      toast.error("Please fill all required fields.");
      return;
    }
    try {
      const data = new FormData();
      data.append("productCategory", form.productCategory);
      data.append("product", form.product);
      data.append("subject", form.subject);
      data.append("inquiry", form.inquiry);
      if (form.image) data.append("image", form.image);

      await axios.post(`${backendUrl}/api/tickets/create`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Ticket submitted successfully!");
      navigate("/my-tickets");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit ticket.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center py-10">
      <div className="max-w-lg w-full bg-white p-8 rounded-2xl shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-black">
          Submit a Support Ticket
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Product Category Dropdown */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              Product Category <span className="text-red-500">*</span>
            </label>
            <select
              name="productCategory"
              value={form.productCategory}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">Select a category</option>
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          {/* Product Dropdown */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              Product <span className="text-red-500">*</span>
            </label>
            <select
              name="product"
              value={form.product}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
              disabled={!form.productCategory}
            >
              <option value="">Select a product</option>
              {form.productCategory &&
                PRODUCTS[form.productCategory]?.map((prod) => (
                  <option key={prod} value={prod}>
                    {prod}
                  </option>
                ))}
            </select>
          </div>
          {/* Subject */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              name="subject"
              type="text"
              placeholder="Subject"
              value={form.subject}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
              maxLength={80}
            />
          </div>
          {/* Inquiry */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              Inquiry <span className="text-red-500">*</span>
            </label>
            <textarea
              name="inquiry"
              rows={4}
              placeholder="Describe your issue..."
              value={form.inquiry}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
              maxLength={500}
            />
          </div>
          {/* Drag & Drop Image Upload */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              Attach Image (optional)
            </label>
            <div
              className={`relative flex flex-col items-center justify-center border-2 ${
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-dashed border-gray-300 bg-gray-50"
              } rounded-xl p-6 transition-all cursor-pointer group`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById("image-upload-input").click()}
              style={{ minHeight: "140px" }}
            >
              {!preview ? (
                <div className="flex flex-col items-center justify-center">
                  <FiPlusCircle className="text-blue-400 group-hover:text-blue-600 mb-2" size={36} />
                  <span className="text-gray-600 font-medium text-base">
                    <span className="font-semibold text-blue-600">Choose file</span> or drag & drop
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    PNG, JPG up to 5MB
                  </span>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border-2 border-blue-400 shadow"
                  />
                  <button
                    type="button"
                    className="absolute -top-2 -right-2 bg-white border border-red-400 text-red-500 rounded-full p-1 shadow hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage();
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}
              <input
                id="image-upload-input"
                type="file"
                name="image"
                accept="image/png, image/jpeg, image/jpg"
                className="hidden"
                onChange={handleImageInput}
              />
            </div>
          </div>
          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-black text-white font-bold py-2 rounded-xl shadow-lg"
          >
            Submit Ticket
          </button>
        </form>
      </div>
    </div>
  );
};

export default TicketRaisePage;
