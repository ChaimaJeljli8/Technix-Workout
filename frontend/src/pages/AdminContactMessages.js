import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../hooks/useAuth';
import AdminNavbar from '../components/AdminNavbar';
import { FaCheckCircle, FaTimesCircle,FaTrash } from 'react-icons/fa';

const AdminContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user,initializeAuth } = useAuthStore();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/contact', {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
        setMessages(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch messages');
        setLoading(false);
      }
    };

    const checkAuthAndFetchMessages = async () => {
        await initializeAuth(); // Verify token first
        if (user && user.token) {
          fetchMessages();
        }
      };
    
      checkAuthAndFetchMessages();
  }, [user.token]);

  const handleStatusUpdate = async (id, status) => {
    try {
      const response = await axios.patch(`http://localhost:4000/api/contact/${id}`, 
        { status },
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );
      
      setMessages(messages.map(msg => 
        msg._id === id ? { ...msg, status: response.data.status } : msg
      ));
    } catch (err) {
      console.error('Failed to update message status', err);
    }
  };

  const handleDeleteReadMessages = async () => {
    if (!window.confirm('Are you sure you want to delete all read messages? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete('http://localhost:4000/api/contact/read', {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      
      // Remove read messages from the state
      setMessages(messages.filter(msg => msg.status !== 'read'));
    } catch (err) {
      console.error('Failed to delete read messages', err);
      setError('Failed to delete read messages');
    }
  };

  if (loading) return <div>Loading messages...</div>;
  if (error) return <div>{error}</div>;

  const readMessagesCount = messages.filter(msg => msg.status === 'read').length;
  return (
    <div className="flex min-h-screen">
    <AdminNavbar />
    <div className="flex-grow p-8 bg-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
        {readMessagesCount > 0 && (
          <button
            onClick={handleDeleteReadMessages}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <FaTrash size={16} />
            Delete All Read Messages ({readMessagesCount})
          </button>
        )}
      </div>
      
      {messages.length === 0 ? (
        <div className="text-center text-gray-500">No messages found</div>
      ) : (
        <div className="space-y-4">
            {messages.map(message => (
              <div 
                key={message._id} 
                className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {message.firstName} {message.lastName}
                    </h2>
                    <p className="text-gray-600 mb-2">{message.email}</p>
                    <p className="text-sm text-gray-500 mb-4">
                      Subject: {message.subject}
                    </p>
                    <p className="text-gray-700">{message.message}</p>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <span 
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase 
                        ${message.status === 'read' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                    >
                      {message.status}
                    </span>
                    <div className="flex space-x-2">
                      {message.status !== 'read' && (
                        <button 
                          onClick={() => handleStatusUpdate(message._id, 'read')}
                          className="text-green-500 hover:text-green-700"
                          title="Mark as Read"
                        >
                          <FaCheckCircle size={20} />
                        </button>
                      )}
                      {message.status !== 'unread' && (
                        <button 
                          onClick={() => handleStatusUpdate(message._id, 'unread')}
                          className="text-red-500 hover:text-red-700"
                          title="Mark as Unread"
                        >
                          <FaTimesCircle size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500 mt-4">
                  Received: {new Date(message.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminContactMessages;