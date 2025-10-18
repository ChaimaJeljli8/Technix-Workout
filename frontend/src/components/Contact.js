import React, { useState } from "react";
import axios from "axios";

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: ""
  });
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:4000/api/contact', formData);
      setStatus("Message sent successfully!");
      setFormData({ firstName: "", lastName: "", email: "", subject: "", message: "" });
    } catch (error) {
      setStatus("Error sending message. Please try again.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div id="Contact" className="py-24">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-teal-600 mb-6">Contact Us</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions? We're here to help! Reach out to us below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xl">
          {status && (
            <div className={`mb-4 p-3 rounded ${status.includes("Error") ? "bg-red-100" : "bg-green-100"}`}>
              {status}
            </div>
          )}
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                required
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>

          <div className="mt-6">
            <label className="block text-gray-700 mb-2">Subject</label>
            <select 
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              required
            >
              <option value="">Select a subject</option>
              <option value="general">General Inquiry</option>
              <option value="Account problems">Account problems</option>
              <option value="Technical problems">Technical problems</option>
              <option value="feedback">Feedback</option>
            </select>
          </div>

          <div className="mt-6">
            <label className="block text-gray-700 mb-2">Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="6"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              required
            ></textarea>
          </div>

          <button 
            type="submit"
            className="mt-8 w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-4 rounded-lg hover:from-teal-700 hover:to-teal-600 transition-all transform hover:scale-105"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;