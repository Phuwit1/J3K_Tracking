interface SelectProps {
  value: string | number;
  onValueChange: (value: string | number) => void;
  children: React.ReactNode;
  className?: string;
}

export default function Select({ value, onValueChange, children, className }: SelectProps) {
    return (
      <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className={`border border-gray-300 p-2 rounded-md w-full ${className}`}
      >
        {children}
      </select>
    );
  }
  