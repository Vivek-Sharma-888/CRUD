const mongoose = require('mongoose');
const validator = require('validator')
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const KEY = "vivekkumarsharmawedsrajulsharma"

const userSchema = new mongoose.Schema({
    mail:{
        type:String,
        unique:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid Email")
            }
        }
    },
    fname:{
        type:String,
    },
    city:{
        type:String,
    },
    mobile:{
        type:String,
    },
    pass:{
        type:String,
    },
    cpass:{
        type:String,
    },
    tokens:[
        {
          token:{
            type:String,
        }
    }],
    verifyToken:{
        type: String,
    }

})

userSchema.pre("save",async function(next){
    if(this.isModified("pass")){
     this.pass =await bcrypt.hash(this.pass,10);
     this.cpass =await bcrypt.hash(this.cpass,10);
    }
    next();
})

userSchema.methods.generateAuthtoken = async function(req,res){

   try {
     const token = jwt.sign({_id:this._id},KEY,{
         expiresIn:"1d"
     })
 
     this.tokens=this.tokens.concat({token:token});
 
     await this.save();
     
     return token ;
   } catch (error) {
    res.status(422).json(error);
   }


}


const Users = new mongoose.model("Users",userSchema);

module.exports = Users;
