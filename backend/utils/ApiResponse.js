/**
 * Standardized API response wrapper.
 * Ensures all successful responses have a consistent structure.
 */
class ApiResponse {
  constructor(statusCode, message, data = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }

  static ok(message, data) {
    return new ApiResponse(200, message, data);
  }

  static created(message, data) {
    return new ApiResponse(201, message, data);
  }

  /**
   * Send the response via Express res object.
   */
  send(res) {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      data: this.data,
    });
  }
}

export default ApiResponse;
