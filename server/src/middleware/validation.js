/**
 * Input validation middleware
 * Validates request body data before processing
 */

export function validateCheckout(req, res, next) {
  const { customerDetails, cartItems, totalPrice } = req.body;

  // Validate customer details
  if (!customerDetails || typeof customerDetails !== "object") {
    return res.status(400).json({
      success: false,
      message: "customerDetails is required and must be an object",
    });
  }

  const required = [
    "fullName",
    "email",
    "phone",
    "addressLine1",
    "city",
    "state",
    "postalCode",
    "country",
  ];
  for (const field of required) {
    if (!customerDetails[field] || typeof customerDetails[field] !== "string") {
      return res.status(400).json({
        success: false,
        message: `customerDetails.${field} is required and must be a string`,
      });
    }
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customerDetails.email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
    });
  }

  // Validate phone format (basic)
  if (!/^\d{10,15}$/.test(customerDetails.phone.replace(/\D/g, ""))) {
    return res.status(400).json({
      success: false,
      message: "Invalid phone number (must be 10-15 digits)",
    });
  }

  // Validate cart items
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({
      success: false,
      message: "cartItems must be a non-empty array",
    });
  }

  for (const item of cartItems) {
    if (!item.productId || !item.name || typeof item.quantity !== "number" || item.quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Each cart item must have productId, name, quantity >= 1",
      });
    }
  }

  // Validate total price
  if (typeof totalPrice !== "number" || totalPrice <= 0) {
    return res.status(400).json({
      success: false,
      message: "totalPrice must be a positive number",
    });
  }

  next();
}

export function validateMpesaSTK(req, res, next) {
  const { phoneNumber, amount, orderId } = req.body;

  // Phone number: 254... format (Kenya M-Pesa)
  if (!phoneNumber || !/^254\d{9}$/.test(phoneNumber)) {
    return res.status(400).json({
      success: false,
      message: "phoneNumber must be in format: 254712345678",
    });
  }

  // Amount: positive number
  if (typeof amount !== "number" || amount < 1 || amount > 999999) {
    return res.status(400).json({
      success: false,
      message: "amount must be a number between 1 and 999999",
    });
  }

  // Order ID: valid MongoDB ID or UUID
  if (!orderId || orderId.trim().length < 5) {
    return res.status(400).json({
      success: false,
      message: "orderId is required",
    });
  }

  next();
}

export function validateSearch(req, res, next) {
  const { q, limit, offset } = req.query;

  if (q) {
    if (typeof q !== "string" || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query (q) must be at least 2 characters",
      });
    }
  }

  if (limit) {
    const parsedLimit = parseInt(limit, 10);
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      return res.status(400).json({
        success: false,
        message: "limit must be a number between 1 and 100",
      });
    }
  }

  if (offset) {
    const parsedOffset = parseInt(offset, 10);
    if (isNaN(parsedOffset) || parsedOffset < 0) {
      return res.status(400).json({
        success: false,
        message: "offset must be a non-negative number",
      });
    }
  }

  next();
}
