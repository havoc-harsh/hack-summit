import { FaUserMd } from "react-icons/fa"; // Example medical icon
import React from "react";

const LandingSection: React.FC = () => {
  return (
    <section className="flex flex-col items-center justify-center text-center bg-blue-100 py-16 px-6">
      <div className="bg-white shadow-lg rounded-lg p-10 max-w-3xl">
        {/* Medical Icon */}
        <div className="text-blue-600 text-6xl mb-4">
          <FaUserMd />
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Healthcare at Your Fingertips
        </h1>

        {/* Subtext */}
        <p className="text-gray-600 text-lg mb-6">
          Find hospitals, manage emergencies, and access real-time medical assistance, all in one place.
        </p>

        {/* CTA Button */}
        <button className="bg-blue-600 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-blue-700 transition">
          Get Started
        </button>
      </div>
    </section>
  );
};

export default LandingSection;
