export default function Card({ children }) {
    return (
      <div className="w-full max-w-md shadow-lg border border-gray-200 rounded-xl bg-white p-6">
        {children}
      </div>
    );
  }
  