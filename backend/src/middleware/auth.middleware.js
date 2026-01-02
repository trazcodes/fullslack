export const protectRoute = (req, res, next) => {
  console.log("into protectRoute");

  const auth = req.auth(); // ✅ correct Clerk API

  if (!auth || !auth.userId) {
    return res
      .status(401)
      .json({ message: "Unauthorized - you must be logged in" });
  }

  console.log("authorized");

  req.userId = auth.userId;
  next();
};
