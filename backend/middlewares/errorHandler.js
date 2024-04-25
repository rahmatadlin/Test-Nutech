const errorHandler = (err, req, res, next) => {
    let status = 500;
    let message = "Internal Server Error";
  
    if (err.name === "LoginError") {
      status = 401;
      message = "Email and password are required";
    }
  
    if (err.name === "WrongEmailPassword") {
      status = 401;
      message = "Invalid email/password";
    }
  
    if (err.name === "ExistedEmail") {
      status = 401;
      message = "Email must be unique";
    }
  
    if (err.name === "EmailFormat") {
      status = 401;
      message = "Invalid email format";
    }
  
    if (err.name === "EmptyEmail") {
      status = 401;
      message = "Email is required";
    }
  
    if (err.name === "EmptyPassword") {
      status = 401;
      message = "Password is required";
    }
  
    if (err.name == "Unauthorized") {
      status = 401;
      message = "Invalid Token";
    }
  
    if (err.name == "JsonWebTokenError") {
      status = 401;
      message = "Invalid Token";
    }
  
    if (err.name == "NotFound") {
      status = 404;
      message = "Hero not found";
    }
  
    res.status(status).json({
      message,
    });
  };
  
  module.exports = errorHandler;