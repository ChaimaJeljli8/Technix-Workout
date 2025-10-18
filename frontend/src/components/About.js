import React, { useState } from "react";
import { FaPlay } from "react-icons/fa"; // Import the play icon

const About = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div 
            id="About" 
            className="about-page bg-cover bg-center text-black min-h-screen py-16"
            style={{ backgroundImage: "url('/images/about.jpeg')" }} // Path to image in public folder
        >
            <div className="container mx-auto px-6 lg:px-12">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-teal-600 mb-4">
                        Our Mission
                    </h1>
                    <p className="text-lg md:text-xl text-black max-w-2xl mx-auto leading-relaxed">
                            Empowering your fitness journey with innovation, motivation, and simplicity.
                    </p>
                </div>

                {/* Content Section */}
                <div className=" flex-col lg:flex-row items-center justify-between gap-12">
                    {/* Text Section */}
                    <div className="lg:w-5/12 text-center lg:text-left">
                        <p className="text-lg md:text-xl text-black leading-relaxed mb-6">
                            At <span className="font-semibold text-teal-500">Technix Workout</span>, we believe that fitness is a journey, not a destination. 
                            Our mission is to provide an easy-to-use platform that helps you track your workouts, stay motivated, and achieve your fitness goals. 
                            Whether you're looking to build strength, improve endurance, or lose weight, we are here to support you every step of the way.
                        </p>
                        <ul className="space-y-4 text-left text-black mb-6">
                            <li className="flex items-center gap-3">
                                <span className="w-4 h-4 bg-teal-600 rounded-full"></span>
                                <p>Track your workouts effortlessly.</p>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="w-4 h-4 bg-teal-600 rounded-full"></span>
                                <p>Stay motivated with progress insights.</p>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="w-4 h-4 bg-teal-600 rounded-full"></span>
                                <p>Achieve your fitness goals with ease.</p>
                            </li>
                        </ul>
                    </div>

                    {/* Button to Open Modal */}
                    <div className="lg:w-7/12 text-right">
                        <button
                            onClick={openModal}
                            className="bg-teal-600 text-white py-3 px-8 rounded-full hover:bg-teal-500 transition duration-300 flex items-center justify-center gap-3 text-xl"
                        >
                            <FaPlay className="text-white" />
                            Watch Video
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-blue-900 bg-opacity-70 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-4xl w-full">
                        <div className="relative">
                            <button
                                onClick={closeModal}
                                className="absolute top-0 right-0 text-white text-2xl font-bold p-2 hover:bg-red-600 rounded-full"
                            >
                                &times;
                            </button>
                            <iframe
                                className="w-full h-[350px] sm:h-[400px] md:h-[450px] lg:h-[500px] rounded-lg"
                                src="https://www.youtube.com/embed/IwFPIfrwaII" // Replace with your video URL
                                title="About Technix Workout"
                                frameBorder="0"
                                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default About;
