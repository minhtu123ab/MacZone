import { useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";

export default function OTPInput({ length = 6, onChange, disabled = false }) {
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const inputRefs = useRef([]);

  useEffect(() => {
    // Auto focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (isNaN(value)) return;

    const newOtp = [...otp];
    // Take only the last character (in case of paste)
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Call onChange with complete OTP
    const otpString = newOtp.join("");
    if (onChange) {
      onChange(otpString);
    }

    // Move to next input if value is entered
    if (value && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }

    // Move to next input on arrow right
    if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }

    // Move to previous input on arrow left
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").slice(0, length);

    // Only process if pasted data contains only numbers
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length && i < length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    // Call onChange with complete OTP
    const otpString = newOtp.join("");
    if (onChange) {
      onChange(otpString);
    }

    // Focus on the next empty input or last input
    const nextIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[nextIndex].focus();
  };

  const handleFocus = (index) => {
    // Select the content on focus
    inputRefs.current[index].select();
  };

  return (
    <div className="flex gap-2 justify-center">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          disabled={disabled}
          className="otp-input w-12 h-14 text-center text-2xl font-semibold 
            bg-dark-hover border-2 border-dark-border rounded-lg
            text-white focus:outline-none focus:border-apple-blue
            hover:border-apple-blue/50 transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed"
        />
      ))}
    </div>
  );
}

OTPInput.propTypes = {
  length: PropTypes.number,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
};
