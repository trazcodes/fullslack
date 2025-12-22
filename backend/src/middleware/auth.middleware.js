export const protectRoute = (req, res, next)=>{
    console.log("into protectRoute");
    
    if(!req.auth().isAuthenticated){
        res.status(401).json({message: "Unauthorized - you must be logged in"});
    console.log("authorized");

}
next();
}