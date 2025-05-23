// MultiSelect.tsx
// import { Select, SelectItem } from '@/components/ui/select';

interface MultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: string[];
  className?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({ value, onChange, options, className }) => {
  const handleSelectChange = (selectedValue: string) => {
    if (value.includes(selectedValue)) {
      onChange(value.filter((item) => item !== selectedValue)); // Remove if already selected
    } else {
      onChange([...value, selectedValue]); // Add to selected values
    }
  };

  return (
    <div className={className}>
      {options.map((option) => (
        <button
          key={option}
          onClick={() => handleSelectChange(option)}
          className={`px-2 py-1 m-1 ${value.includes(option) ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          {option}
        </button>
      ))}
    </div>
  );
};
