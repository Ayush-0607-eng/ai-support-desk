const Loader = ({ fullScreen = false }: { fullScreen?: boolean }) => {
  return (
    <div className={`flex items-center justify-center ${fullScreen ? "h-screen" : "h-40"}`}>
      <div className="w-10 h-10 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin dark:border-violet-900 dark:border-t-violet-400" />
    </div>
  );
};

export default Loader;
