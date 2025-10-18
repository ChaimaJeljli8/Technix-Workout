import React, { useEffect, useState } from "react";

const VisitorCounter = () => {
    const [counts, setCounts] = useState({ visitors: 100, admins: 5, users: 10 });
  
    useEffect(() => {
      const interval = setInterval(() => {
        setCounts(prev => ({
          visitors: prev.visitors + Math.floor(Math.random() * 20),
          admins: prev.admins + Math.floor(Math.random() * 5),
          users: prev.users + Math.floor(Math.random() * 3)
        }));
      }, 100);
      return () => clearInterval(interval);
    }, []);
  
    return (
      <div className="-gradient-to-r from-gray-500 to-white-500 py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Object.entries(counts).map(([key, value]) => (
              <div key={key} className="bg-black/20 backdrop-blur-sm rounded-xl p-8 text-center">
                <div className="text-5xl font-bold text-white mb-2">{value}+</div>
                <div className="text-xl text-blue-600 capitalize">{key}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  

export default VisitorCounter;
