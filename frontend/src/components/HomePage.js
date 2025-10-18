import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
    const [currentBg, setCurrentBg] = useState(0);
    const backgrounds = [
      'images/Background1.jpeg',
      'images/Background2.jpeg',
      'images/Background3.jpeg',
      'images/Background4.jpeg'
    ];
  
    useEffect(() => {
      const timer = setInterval(() => {
        setCurrentBg(prev => (prev + 1) % backgrounds.length);
      }, 5000);
      return () => clearInterval(timer);
    }, []);
  
    return (
      <div className="relative h-screen" id="home">
        {backgrounds.map((bg, index) => (
          <div
            key={bg}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
              currentBg === index ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ backgroundImage: `url(${bg})` }}
          />
        ))}
        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-6">
            <div className="max-w-xl bg-black/20 backdrop-blur-sm p-8 rounded-xl">
              <h1 className="text-5xl font-bold text-white mb-6">
                Transform Your Life Through Fitness
              </h1>
              <p className="text-xl text-gray-100 mb-8">
                Take control of your fitness journey with our intelligent workout tracker.
              </p>
              <Link to="/signup">
                <button className="px-8 py-3 bg-gradient-to-r from-teal-500 to-teal-700 hover:from-teal-700 hover:to-teal-500 text-white rounded-full transform hover:scale-105 transition-all">
                  Start Your Journey
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
export default HomePage;
