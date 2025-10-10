// Generate random 6-digit code
export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate code expiry time (5 minutes from now)
export const generateCodeExpiry = () => {
  return new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
};

// Check if code is expired
export const isCodeExpired = (expiryDate) => {
  return new Date() > new Date(expiryDate);
};
