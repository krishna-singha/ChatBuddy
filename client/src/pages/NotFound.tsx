import { Link } from "react-router-dom";

const NotFound = () => {

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-4">
      <h1 className="text-6xl font-bold text-cyan-400 mb-4">404</h1>
      <p className="text-xl mb-6">Oops! The page you're looking for doesn't exist.</p>
      <Link
        to="/"
        className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:scale-105 transition-transform"
      >
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFound;