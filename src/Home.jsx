import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#1a2436] text-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] opacity-20 bg-cover bg-center" />

      {/* Content */}
      <div className="relative flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-6xl font-bold mb-12 text-center text-amber-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          Pirate's Treasure
        </h1>

        <div className="flex flex-col gap-6 w-full max-w-md">
          <button
            onClick={() => navigate("/lobby")}
            className="relative group bg-amber-600 hover:bg-amber-500 text-white px-8 py-4 rounded-lg transform transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
          >
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 rounded-lg transition-opacity" />
            <div className="flex items-center justify-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-xl font-bold">Play Game</span>
            </div>
          </button>

          <button
            onClick={() => navigate("/market")}
            className="relative group bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-lg transform transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
          >
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 rounded-lg transition-opacity" />
            <div className="flex items-center justify-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span className="text-xl font-bold">Marketplace</span>
            </div>
          </button>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-4 left-4 text-amber-400/60">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </div>
        <div className="absolute top-4 right-4 text-amber-400/60">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 5l-7 7 7 7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Home;
