const mongoose =require("mongoose")
const validator = require('validator')

const userPhoto = new mongoose.Schema({

    email:{
        type:String,
        require:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid Email")
            }
        }
    },
    
    imgpath:{
        type:String,
        require:true
    }


})

const profile = new mongoose.model("profile",userPhoto)

module.exports=profile;