export const protectRoute = (req, res, next) => {
  console.log("into protectRoute");

  if (!req.auth || !req.auth.userId) {
    return res
      .status(401)
      .json({ message: "Unauthorized - you must be logged in" });
  }

  console.log("authorized");

  // Attach userId for downstream controllers
  req.userId = req.auth.userId;

  next();
};
