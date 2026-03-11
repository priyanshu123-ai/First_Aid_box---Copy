import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
  try {
    const { token } =  req.cookies;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token not found",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    req.userId = decoded.userId
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({
        success:false,
        message:error.message
    })
  }
};

export default isAuth