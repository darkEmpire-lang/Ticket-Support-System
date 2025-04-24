import React, { useEffect, useState, useContext, useRef } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

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

const MyTickets = () => {
  const { token } = useContext(ShopContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editTicketId, setEditTicketId] = useState(null);
  const [editForm, setEditForm] = useState({
    productCategory: "",
    product: "",
    subject: "",
    inquiry: "",
    image: null,
  });
  const [preview, setPreview] = useState(null);
  const [resolvedCount, setResolvedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [editError, setEditError] = useState("");
  const [editAllowed, setEditAllowed] = useState(true);
  const [nextEditTime, setNextEditTime] = useState("");
  const fileInputRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/tickets/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const updatedTickets = response.data.tickets.map((ticket) => ({
          ...ticket,
          status: ticket.replies && ticket.replies.length > 0 ? "Resolved" : "Pending",
        }));
        setTickets(updatedTickets);
        setResolvedCount(updatedTickets.filter((t) => t.status === "Resolved").length);
        setPendingCount(updatedTickets.filter((t) => t.status === "Pending").length);
      } catch (error) {
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchTickets();
    const interval = setInterval(() => {
      if (token) fetchTickets();
    }, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const deleteTicket = async (ticketId) => {
    Swal.fire({
      title: "Are you sure delete this ticket?",
      text: "You won't be able to revert this ticket!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:4000/api/tickets/delete/${ticketId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const updatedTickets = tickets.filter((ticket) => ticket._id !== ticketId);
          setTickets(updatedTickets);
          setResolvedCount(updatedTickets.filter((t) => t.status === "Resolved").length);
          setPendingCount(updatedTickets.filter((t) => t.status === "Pending").length);
          Swal.fire("Deleted!", "Your ticket has been deleted.", "success");
        } catch (error) {
          Swal.fire("Error", "Failed to delete ticket.", "error");
        }
      }
    });
  };

  const editTicket = (ticket) => {
    setEditTicketId(ticket._id);
    setEditForm({
      productCategory: ticket.productCategory || "",
      product: ticket.product || "",
      subject: ticket.subject || "",
      inquiry: ticket.inquiry || "",
      image: null,
    });
    setPreview(ticket.image || null);
    setEditError("");
    // 24-hour restriction logic
    const lastEditTime = new Date(ticket.updatedAt || ticket.createdAt);
    const now = new Date();
    const diffHours = (now - lastEditTime) / (1000 * 60 * 60);
    if (diffHours < 24) {
      setEditAllowed(false);
      const next = new Date(lastEditTime.getTime() + 24 * 60 * 60 * 1000);
      setNextEditTime(next.toLocaleString());
    } else {
      setEditAllowed(true);
      setNextEditTime("");
    }
  };

  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files[0];
      if (file) {
        if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
          setEditError("Only PNG and JPG images are allowed.");
          return;
        }
        if (file.size > MAX_FILE_SIZE) {
          setEditError("Image must be less than 5MB.");
          return;
        }
        setEditForm((prev) => ({ ...prev, image: file }));
        setPreview(URL.createObjectURL(file));
        setEditError("");
      }
    } else if (name === "productCategory") {
      setEditForm((prev) => ({
        ...prev,
        productCategory: value,
        product: "",
      }));
    } else {
      setEditForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const removeImage = () => {
    setEditForm((prev) => ({ ...prev, image: null }));
    setPreview(null);
  };

  const updateTicket = async () => {
    if (
      !editForm.productCategory ||
      !editForm.product ||
      !editForm.subject ||
      !editForm.inquiry
    ) {
      setEditError("Please fill all required fields.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("productCategory", editForm.productCategory);
      formData.append("product", editForm.product);
      formData.append("subject", editForm.subject);
      formData.append("inquiry", editForm.inquiry);
      if (editForm.image) formData.append("image", editForm.image);

      const response = await axios.put(
        `http://localhost:4000/api/tickets/update/${editTicketId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const updatedTickets = tickets.map((ticket) =>
        ticket._id === editTicketId
          ? {
              ...ticket,
              productCategory: response.data.ticket.productCategory,
              product: response.data.ticket.product,
              subject: response.data.ticket.subject,
              inquiry: response.data.ticket.inquiry,
              image: response.data.ticket.image,
              updatedAt: response.data.ticket.updatedAt,
            }
          : ticket
      );
      setTickets(updatedTickets);
      setEditTicketId(null);
      setEditForm({
        productCategory: "",
        product: "",
        subject: "",
        inquiry: "",
        image: null,
      });
      setPreview(null);
      setEditError("");
      Swal.fire("Updated!", "Your ticket has been updated.", "success");
    } catch (error) {
      setEditError(
        error.response?.data?.message ||
          "You can only edit a ticket once every 24 hours."
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-5">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 text-center">My Tickets</h2>
        <button
          className="flex items-center bg-black text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
          onClick={() => navigate("/submit-ticket")}
        >
          <FaPlus className="mr-2" />
          Add Ticket
        </button>
      </div>
      <div className="flex justify-center space-x-6 mb-6">
        <p className="text-lg font-semibold text-gray-700">Total Tickets: {tickets.length}</p>
        <p className="text-lg font-semibold text-green-600">Resolved: {resolvedCount}</p>
        <p className="text-lg font-semibold text-yellow-500">Pending: {pendingCount}</p>
      </div>
      {loading ? (
        <p className="text-gray-600 text-center">Loading tickets...</p>
      ) : tickets.length === 0 ? (
        <p className="text-gray-600 text-center">No tickets found.</p>
      ) : (
        <div className="space-y-6">
          {tickets.map((ticket) => (
            <div key={ticket._id} className="p-5 border rounded-lg shadow-lg bg-white">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="text-xl font-semibold text-blue-600 mb-1">
                    {ticket.subject}
                  </h3>
                  <div className="flex flex-wrap gap-4 mb-1">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                      {ticket.productCategory}
                    </span>
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold">
                      {ticket.product}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-3 text-gray-500">
                  <FaEdit
                    className="cursor-pointer hover:text-blue-500"
                    title="Edit Ticket"
                    onClick={() => editTicket(ticket)}
                  />
                  <FaTrash
                    className="cursor-pointer hover:text-red-500"
                    title="Delete Ticket"
                    onClick={() => deleteTicket(ticket._id)}
                  />
                </div>
              </div>
              <div className="mb-2">
                <span className="font-semibold text-gray-700">Issue:</span>
                <span className="ml-2 text-gray-800">{ticket.inquiry}</span>
              </div>
              <div className="mb-2">
                <span className="font-semibold text-gray-700">Image:</span>
                {ticket.image ? (
                  <img
                    src={ticket.image}
                    alt="Ticket"
                    className="w-24 h-24 object-cover rounded-lg border ml-2 inline-block"
                  />
                ) : (
                  <span className="ml-2 text-gray-400">No Image</span>
                )}
              </div>
              <p className="text-sm text-gray-700">
                Status:{" "}
                <span
                  className={`font-semibold ${
                    ticket.status === "Resolved"
                      ? "text-green-600"
                      : "text-yellow-500"
                  }`}
                >
                  {ticket.status}
                </span>
              </p>
              <div className="mt-4">
                <p className="text-gray-700 font-medium">Replies:</p>
                {ticket.replies?.length > 0 ? (
                  <div className="space-y-2 mt-2">
                    {ticket.replies.map((reply, index) => (
                      <div
                        key={index}
                        className="bg-gray-100 p-3 rounded-lg border-l-4 border-blue-500"
                      >
                        <p className="text-sm text-gray-800">{reply.message}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(reply.date).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No replies yet.</p>
                )}
              </div>
              {/* Edit Modal */}
              {editTicketId === ticket._id && (
                <div className="fixed inset-0 bg-white bg-opacity-40 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg relative">
                    <button
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl"
                      onClick={() => setEditTicketId(null)}
                    >
                      &times;
                    </button>
                    <h3 className="text-xl font-bold mb-4 text-blue-700">
                      Edit Ticket
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block mb-1 font-semibold text-gray-700">
                          Product Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="productCategory"
                          value={editForm.productCategory}
                          onChange={handleEditChange}
                          className="w-full p-2 border rounded"
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
                      <div>
                        <label className="block mb-1 font-semibold text-gray-700">
                          Product <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="product"
                          value={editForm.product}
                          onChange={handleEditChange}
                          className="w-full p-2 border rounded"
                          required
                          disabled={!editForm.productCategory}
                        >
                          <option value="">Select a product</option>
                          {editForm.productCategory &&
                            PRODUCTS[editForm.productCategory]?.map((prod) => (
                              <option key={prod} value={prod}>
                                {prod}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div>
                        <label className="block mb-1 font-semibold text-gray-700">
                          Subject <span className="text-red-500">*</span>
                        </label>
                        <input
                          name="subject"
                          type="text"
                          placeholder="Subject"
                          value={editForm.subject}
                          onChange={handleEditChange}
                          className="w-full p-2 border rounded"
                          required
                          maxLength={80}
                        />
                      </div>
                      <div>
                        <label className="block mb-1 font-semibold text-gray-700">
                          Inquiry <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          name="inquiry"
                          rows={3}
                          placeholder="Describe your issue..."
                          value={editForm.inquiry}
                          onChange={handleEditChange}
                          className="w-full p-2 border rounded"
                          required
                          maxLength={500}
                        />
                      </div>
                      <div>
                        <label className="block mb-1 font-semibold text-gray-700">
                          Image (optional)
                        </label>
                        <div className="flex items-center gap-4">
                          {preview && (
                            <div className="relative">
                              <img
                                src={preview}
                                alt="Preview"
                                className="w-20 h-20 object-cover rounded-lg border"
                              />
                              <button
                                type="button"
                                className="absolute -top-2 -right-2 bg-white border border-red-400 text-red-500 rounded-full p-1 shadow hover:bg-red-50"
                                onClick={removeImage}
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
                            ref={fileInputRef}
                            type="file"
                            name="image"
                            accept="image/png,image/jpeg,image/jpg"
                            className="block"
                            onChange={handleEditChange}
                          />
                        </div>
                        <span className="text-xs text-gray-400">
                          PNG, JPG up to 5MB
                        </span>
                      </div>
                      {editError && (
                        <div className="text-red-500 text-sm">{editError}</div>
                      )}
                      {!editAllowed && (
                        <div className="text-yellow-600 text-sm">
                          You can only edit a ticket once every 24 hours.
                          <br />
                          Next update allowed: <b>{nextEditTime}</b>
                        </div>
                      )}
                      <div className="flex justify-end gap-2 mt-4">
                        <button
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                          onClick={() => setEditTicketId(null)}
                          type="button"
                        >
                          Cancel
                        </button>
                        <button
                          className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${
                            !editAllowed ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                          onClick={updateTicket}
                          type="button"
                          disabled={!editAllowed}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTickets;
