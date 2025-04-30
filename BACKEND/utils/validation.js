// Email validation using regular expression
exports.validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation - basic check for minimum length
exports.validatePassword = (password) => {
  return password.length >= 6;
};

// Phone number validation
exports.validatePhoneNumber = (phoneNumber) => {
  // Remove any non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  // Check if it has exactly 10 digits
  return digitsOnly.length === 10;
};
