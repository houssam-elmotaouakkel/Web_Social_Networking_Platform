// backend/src/utils/asyncHandler.js
// Note: Express 5 natively handles async errors, so this wrapper is technically
// optional. Kept as a safety net for edge cases and explicit .catch() propagation.
module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
