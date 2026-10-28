const body = {
  string(value, min, max) {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed.length >= min && trimmed.length <= max ? trimmed : null;
  },
  email(value) {
    if (typeof value !== "string") return null;
    const email = value.trim().toLowerCase();
    return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
  }
};
function validationResult() { return null; }
module.exports = { body, validationResult };
