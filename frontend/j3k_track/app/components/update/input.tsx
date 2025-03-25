interface InputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export default function Input({ value, onChange, placeholder }: InputProps) {
    return (
      <input
        type="text"
        className="border border-gray-300 p-2 rounded-md w-full"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    );
  }
  