
const jwt = require("jsonwebtoken");
const Users = require("../model/userSchema");
const KEY = "vivekkumarsharmawedsrajulsharma"

const authenticate = async(req,res,next)=>{
   
    
     const token = req.headers.authorization
    try {
        const verifytoken = jwt.verify(token,KEY)
        const rootUser = await Users.findOne({_id:verifytoken._id})       
        if(!rootUser){
           throw new Error("User not found")
        }    
        req.token = token;
        req.rootUser=rootUser;
        req.userId=rootUser._id; 
        next();
    } catch (error) {
        res.status(401).json(error)
    }
}

module.exports=authenticate;