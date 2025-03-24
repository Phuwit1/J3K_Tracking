export default function Textarea({ value, onChange, placeholder, className }) {
    return (
      <textarea
        className={`border border-gray-300 p-2 rounded-md w-full ${className}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    );
  }
  