import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css"; // Import Font Awesome CSS
import {  FaArrowUp } from 'react-icons/fa';

const Footer = () => {
    const [showScrollTop, setShowScrollTop] = useState(false);
  
    useEffect(() => {
      const handleScroll = () => setShowScrollTop(window.scrollY > 300);
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);
  
    return (
      <footer className="bg-gray-900 text-gray-300 shadow-md">
        <div className="container mx-auto py-12 px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-4">Technix Workout</h3>
              <p className="text-teal-200">Your partner in achieving fitness goals.</p>
            </div>
            <div >
              <h4 className="text-xl font-semibold mb-4">Quick Links</h4>
              <div className="flex">
              <nav className="flex flex-col space-y-2 ">
                <a href="#About" className="text-white-300  transition-colors">About</a>
                <a href="#Workouts" className="text-white-300  transition-colors">Workouts</a>
                <a href="#Contact" className="text-white-300 transition-colors">Contact</a>
              </nav>

               <div className="flex-1 ml-4 p-2">
                <p className="text-sm text-gray-400 text-center md:text-left mb-4 md:mb-0">
                    Follow us on social media:
                </p>
                <div className="flex justify-center md:justify-start space-x-4">
                    <a
                        href="https://www.facebook.com/TechnixInfo"
                        className="text-gray-400 hover:text-white transition-colors text-xl"
                    >
                        <i className="fab fa-facebook-f"></i>
                    </a>
                    <a
                        href="https://twitter.com"
                        className="text-gray-400 hover:text-white transition-colors text-xl"
                    >
                        <i className="fab fa-twitter"></i>
                    </a>
                    <a
                        href="https://linkedin.com"
                        className="text-gray-400 hover:text-white transition-colors text-xl"
                    >
                        <i className="fab fa-linkedin-in"></i>
                    </a>
                    <a
                        href="https://instagram.com"
                        className="text-gray-400 hover:text-white transition-colors text-xl"
                    >
                        <i className="fab fa-instagram"></i>
                    </a>
                </div>
                </div>
                </div>
            </div>

            
            <div>
              <h4 className="text-xl font-semibold mb-4">Contact</h4>
              <div className="text-white-300 space-y-2">
                <p>📞 (+216) 26 300 098</p>
                <p>📧 info@technix-technology.com</p>
                <p>📍 Rue de la connaissance, Rafraf 7015</p>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-600">
          <div className="container mx-auto py-6 px-6 text-center text-gray-300">
            © {new Date().getFullYear()} Technix Workout. All rights reserved.
          </div>
        </div>
        {showScrollTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 bg-teal-500 p-4 rounded-full shadow-lg hover:bg-teal-600 transition-colors"
          >
            <FaArrowUp />
          </button>
        )}
      </footer>
    );
  };

export default Footer;
