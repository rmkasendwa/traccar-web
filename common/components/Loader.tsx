const Loader = () => (
  <div
    className="flex min-h-full w-full items-center justify-center"
    role="status"
    aria-label="Loading"
  >
    <div className="size-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-700" />
  </div>
);

export default Loader;
