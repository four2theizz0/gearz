'use client';
import { useState, useEffect, useRef } from 'react';

interface AutocompleteDropdownProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  field: string; // The field name to fetch values for (e.g., 'category', 'brand')
}

export default function AutocompleteDropdown({
  name,
  value,
  onChange,
  placeholder,
  className = '',
  field
}: AutocompleteDropdownProps) {
  const [options, setOptions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch existing values when component mounts
  useEffect(() => {
    async function fetchOptions() {
      setLoading(true);
      try {
        const response = await fetch(`/api/products/field-values?field=${field}`);
        const result = await response.json();
        if (result.success) {
          setOptions(result.values);
          setFilteredOptions(result.values);
        }
      } catch (error) {
        console.error('Error fetching options:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOptions();
  }, [field]);

  // Filter options based on input value
  useEffect(() => {
    if (value) {
      const filtered = options.filter(option =>
        option.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [value, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(true);
  }

  function handleOptionClick(option: string) {
    onChange(option);
    setIsOpen(false);
  }

  function handleInputFocus() {
    setIsOpen(true);
  }

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <input
        name={name}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        placeholder={placeholder || `Enter ${field}...`}
        className="input-field w-full"
        autoComplete="off"
      />
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="px-3 py-2 text-gray-400">Loading...</div>
          ) : filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleOptionClick(option)}
                className="w-full text-left px-3 py-2 hover:bg-gray-700 focus:bg-gray-700 focus:outline-none"
              >
                {option}
              </button>
            ))
          ) : value ? (
            <div className="px-3 py-2 text-gray-400">
              Press Enter to add &quot;{value}&quot; as new {field}
            </div>
          ) : (
            <div className="px-3 py-2 text-gray-400">No options available</div>
          )}
        </div>
      )}
    </div>
  );
} 