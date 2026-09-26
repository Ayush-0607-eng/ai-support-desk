import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-violet-50 dark:bg-slate-950 px-4">
      <div className="text-center">
        <Compass size={48} className="mx-auto text-violet-400 mb-4" />
        <h1 className="text-3xl font-display font-bold text-slate-800 dark:text-white">Page not found</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">The page you are looking for does not exist</p>
        <Link to="/" className="inline-block mt-6 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium transition-colors duration-200">Back to dashboard</Link>
      </div>
    </div>
  );
};

export default NotFound;
