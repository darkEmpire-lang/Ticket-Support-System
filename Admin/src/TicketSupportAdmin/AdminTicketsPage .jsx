import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTrash } from "react-icons/fa";

// You can use a default avatar image from your public folder or an online source
const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?name=User&background=cccccc&color=555555&size=128";

const AdminTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [replyData, setReplyData] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    fetchTickets();
    // Optionally, auto-refresh tickets every 10 seconds:
    // const interval = setInterval(fetchTickets, 10000);
    // return () => clearInterval(interval);
  }, []);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:4000/api/tickets/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(response.data.tickets);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to fetch tickets");
    }
  };

  const handleReplyChange = (ticketId, value) => {
    setReplyData((prev) => ({ ...prev, [ticketId]: value }));
  };

  const handleReplySubmit = async (ticketId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:4000/api/tickets/reply",
        { ticketId, reply: replyData[ticketId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Reply sent successfully");
      setReplyData((prev) => ({ ...prev, [ticketId]: "" }));
      fetchTickets();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to send reply");
    } finally {
      setLoading(false);
    }
  };

  const deleteTicket = async (ticketId) => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:4000/api/tickets/delete/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(tickets.filter((ticket) => ticket._id !== ticketId));
      setMessage("Ticket deleted successfully");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to delete ticket");
    }
  };

  const loadMoreTickets = () => {
    setVisibleCount((prev) => prev + 5);
  };

  // Calculate ticket stats
  const totalTickets = tickets.length;
  const ticketsToReply = tickets.filter((ticket) => ticket.replies.length === 0).length;
  const repliedTickets = totalTickets - ticketsToReply;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 shadow-lg rounded-lg">
        <h2 className="text-3xl font-bold text-center text-black">Admin Ticket Management</h2>
        {message && (
          <p className="text-center text-gray-700 mt-2">{message}</p>
        )}

        {/* Ticket Counts */}
        <div className="flex justify-between mt-4 text-lg font-semibold">
          <p>
            Total Tickets: <span className="text-blue-600">{totalTickets}</span>
          </p>
          <p>
            Tickets to Reply:{" "}
            <span className="text-red-600">{ticketsToReply}</span>
          </p>
          <p>
            Replied Tickets:{" "}
            <span className="text-green-600">{repliedTickets}</span>
          </p>
        </div>

        <div className="mt-6">
          {tickets.length === 0 ? (
            <p className="text-center text-gray-600">No tickets available</p>
          ) : (
            tickets.slice(0, visibleCount).map((ticket) => (
              <div
                key={ticket._id}
                className="border-b py-4 flex justify-between items-start"
              >
                <div className="w-full flex">
                  {/* User profilePic */}
                  <img
                    src={
                      ticket.userId?.profilePic
                        ? ticket.userId.profilePic
                        : DEFAULT_AVATAR
                    }
                    alt="Profile"
                    className="w-14 h-14 rounded-full mr-4 border-2 border-blue-500 object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-semibold">
                      {ticket.userId?.name || "Unknown"} (
                      {ticket.userId?.email || "No Email"})
                    </p>
                    <p className="text-gray-700 mb-1">
                      <strong>Category:</strong> {ticket.productCategory} |{" "}
                      <strong>Product:</strong> {ticket.product}
                    </p>
                    <p className="text-gray-700">
                      <strong>Subject:</strong> {ticket.subject}
                    </p>
                    <p className="text-gray-700">{ticket.inquiry}</p>
                    {ticket.image && (
                      <img
                        src={ticket.image}
                        alt="Ticket Attachment"
                        className="w-32 h-32 object-cover rounded mt-2 border"
                      />
                    )}
                    <p
                      className={`text-sm font-medium mt-1 ${
                        ticket.replies.length > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {ticket.replies.length > 0
                        ? "Replied"
                        : "Awaiting Reply"}
                    </p>
                    <div className="mt-2">
                      {ticket.replies.length > 0 ? (
                        ticket.replies.map((r, i) => (
                          <div
                            key={i}
                            className="bg-gray-100 p-2 rounded-md mt-1"
                          >
                            <p className="text-gray-800">{r.message}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(r.date).toLocaleString()}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No reply yet</p>
                      )}
                    </div>
                    <textarea
                      className="w-full p-2 border rounded-md mt-2"
                      rows="2"
                      placeholder="Write a reply..."
                      value={replyData[ticket._id] || ""}
                      onChange={(e) =>
                        handleReplyChange(ticket._id, e.target.value)
                      }
                    />
                    <button
                      className="bg-black text-white py-2 px-4 rounded-md mt-2 hover:bg-blue-700 transition"
                      onClick={() => handleReplySubmit(ticket._id)}
                      disabled={loading || !replyData[ticket._id]}
                    >
                      {loading ? "Sending..." : "Send Reply"}
                    </button>
                  </div>
                </div>
                <FaTrash
                  className="text-red-600 cursor-pointer hover:text-red-800 ml-4"
                  size={20}
                  title="Delete Ticket"
                  onClick={() => deleteTicket(ticket._id)}
                />
              </div>
            ))
          )}
        </div>

        {visibleCount < tickets.length && (
          <button
            className="mt-4 bg-gray-800 text-white py-2 px-4 rounded-md w-full hover:bg-gray-900 transition"
            onClick={loadMoreTickets}
          >
            View More
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminTicketsPage;
