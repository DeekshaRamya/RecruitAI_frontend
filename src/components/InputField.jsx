import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const InputField = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  icon: Icon,
  id,
  name,
  required = true,
  role = 'candidate'
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const isRecruiter = role === 'recruiter' || role === 'admin';

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const currentType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="flex flex-col gap-1.5 relative group">
      <label 
        htmlFor={id} 
        className={`text-[0.8rem] font-semibold transition-colors duration-300 ${
          isRecruiter 
            ? 'text-recruiter-text-sub group-focus-within:text-recruiter-accent' 
            : 'text-candidate-text-main group-focus-within:text-candidate-primary'
        }`}
      >
        {label}
      </label>
      <div className="relative flex items-center">
        {Icon && (
          <div 
            className={`absolute left-3.5 text-[#94a3b8] pointer-events-none flex items-center transition-colors duration-300 ${
              isRecruiter 
                ? 'group-focus-within:text-recruiter-accent' 
                : 'group-focus-within:text-candidate-primary'
            }`}
          >
            <Icon size={18} />
          </div>
        )}
        <input
          type={currentType}
          id={id}
          name={name}
          className={`w-full bg-input-bg-light border border-input-border-light rounded-lg py-2.5 px-4 pl-10 text-[0.9rem] font-inter transition-all duration-250 ease-in-out outline-none ${
            isRecruiter 
              ? 'text-recruiter-text-main focus:border-recruiter-accent focus:ring-3 focus:ring-recruiter-accent/8' 
              : 'text-candidate-text-main focus:border-candidate-primary focus:ring-3 focus:ring-candidate-primary/8'
          }`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={isPassword ? 'current-password' : 'email'}
        />
        {isPassword && (
          <button
            type="button"
            className={`absolute right-4 bg-transparent border-none text-[#94a3b8] cursor-pointer flex items-center transition-colors duration-200 ${
              isRecruiter ? 'hover:text-recruiter-text-main' : 'hover:text-candidate-text-main'
            }`}
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default InputField;
