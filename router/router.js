const express = require("express");
const Users = require("../model/userSchema");
const bcrypt = require("bcryptjs");
const authenticate = require("../Authenticate/authenticate");
const upload = require("../multer");
const profile = require("../model/userPhoto");
const router = new express.Router();
const csv = require("fast-csv")
const fs = require("fs")
const jwt = require("jsonwebtoken");
const KEY = "vivekkumarsharmawedsrajulsharma"
const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
   service:"gmail",
  auth:{
    user:process.env.EMAIL,
    pass:process.env.PASSWORD
  }
})


router.post("/sign",async(req,res)=>{
    const {mail,fname,city,mobile,pass,cpass} = req.body ;
      console.log(mail,fname,city,mobile,pass,cpass);
    if(!mail||!fname||!city||!mobile||!pass||!cpass){
        console.log("Please enter the credentials")
    }

    try {
        const preUser = await Users.findOne({mail:mail})
        if (!preUser) {
            const newUser = new Users({
                mail,fname,city,mobile,pass,cpass
            })

            await newUser.save();
            res.status(201).json(newUser);

        } else {
           console.log("User already registered") 
        }
    } catch (error) {
        console.log(error)
    } });

    router.post("/login",async(req,res)=>{
        const {mail,pass} = req.body ;
          
        const userValid = await Users.findOne({mail:mail});
        if(userValid){
          const isMatch = await bcrypt.compare(pass,userValid.pass);
            if(!isMatch){
             console.log("Invalid Credentials")
            }else{
              const token = await userValid.generateAuthtoken();
                res.cookie("userToken",token,{
                    expires:new Date(Date.now()+900000),
                    httpOnly:true
                });
                
               const result ={token,userValid} 
               res.status(201).json(result);
            } 

        }else{
            console.log("User not Found")
        }
      
      });


      router.post("/sendlink",async(req,res)=>{
        const Value = req.body.Value;
        try {
          const validUser = await Users.findOne({mail:Value})
          const token = jwt.sign({_id:validUser._id},KEY,{
            expiresIn:"1d"
          })
         
          setusertoken = await Users.findByIdAndUpdate({_id:validUser._id},{verifyToken:token},{new:true})
          console.log(setusertoken);
          if(setusertoken){
            
            const mailOptions ={
              from:process.env.EMAIL,
              to:Value,
              subject:"WELCOME MAIL",
              text:`this link is valid for 1 day http://localhost:3000/forgetpassword/${validUser._id}/${setusertoken.verifyToken}`
            }

            transporter.sendMail(mailOptions,(error,info)=>{
              if (error) {
                console.log(error);
                res.status(401).json({message:"email not sent"})
              } else {
                console.log("email sent",info.response)
                res.status(201).json("email sent successfully")
              }
            })

          }

        } catch (error) {
          res.status(401).json("Issue with email")
        }


      })

     router.get("/forgotpass/:id/:token",async(req,res)=>{
      const {id,token}=req.params
      const validuser = await Users.findOne({_id:id},{verifyToken:token})
      const validateToken = jwt.verify(token,KEY)
      try {
         if(validuser && validateToken){
          res.status(201).json(validuser)
         }else{
          res.status(401).json("User doesn't exist")
         }
      } catch (error) {
        res.status(401).json(error)
      }
     });

    router.post("/reset/:id/:token",async(req,res)=>{
      const {password} = req.body;
      const {id,token}  = req.params;
      const validuser = await Users.findOne({_id:id},{verifyToken:token})
      const validateToken = jwt.verify(token,KEY)
      try {
         if(validuser && validateToken){
          const newPassword = await bcrypt.hash(password,10)
          const setNewPassword = await Users.findByIdAndUpdate({_id:id},{pass:newPassword})
          console.log(setNewPassword)
           await setNewPassword.save();
          res.status(201).json("Password set successfully")
         }else{
          res.status(401).json("User doesn't exist")
         }
      } catch (error) {
        res.status(401).json(error)
      }
    }
    )

    router.post("/uploadphoto",upload.single("photo"),async(req,res)=>{
      const {filename} = req.file ;
      const {email} = req.body ;

      try {
        const newProfile = new profile({
          email:email,
          imgpath:filename
        })

        await newProfile.save();
        const profileData = await profile.find()
        res.status(200).json(profileData);
        
      } catch (error) {
        console.log("not added")
      }


    })
      

    router.get("/dashboardValid",authenticate,async(req,res)=>{
       
        try {
            const validUserOne = await Users.findOne({_id:req.userId})
             res.status(201).json(validUserOne);
        } catch (error) {
            res.status(422).json({"message":error})
        } 
    })  

    router.get("/getall",async(req,res)=>{
      
      try {
        const AllUsersData =await Users.find();
        res.status(201).json(AllUsersData)
      }catch(error){
          res.status(422).json(error)
      }})
        

      router.get("/logout",authenticate,async(req,res)=>{
       
        try {
          req.rootUser.tokens = req.rootUser.tokens.filter((curelm)=> curelm.token !== req.token )
          res.clearCookie("userCookie",{path:"/"})
          req.rootUser.save();
          
          res.status(201).json(req.rootUser.tokens);
        } catch (error) {
            res.status(422).json({"message":error})
        } 
    }) 



    router.get("/exporting",async(req,res)=>{
      
     try {
       const AllUsersData =await Users.find();
         console.log(AllUsersData);
       const csvStream = csv.format({headers:true})
 
       if(!fs.existsSync("public/files/export/")){
         if(!fs.existsSync("public/files")){
           fs.mkdirSync("public/files/")   
       }
       if(!fs.existsSync("public/files/export")){
         fs.mkdirSync("./public/files/export/")   
     }
   }
        
   const writeableStream = fs.createWriteStream(
    "public/files/export/user.csv");
    
   csvStream.pipe(writeableStream); 
 
   writeableStream.on("finish",function(){
     res.json({
       downloadUrl:`${process.env.URL}/files/export/user.csv`
     });
   });
 
   if(AllUsersData.length > 0){
        AllUsersData.map((userr)=>{
         csvStream.write({
            Email:userr.mail?userr.mail:"-",
            Fullname:userr.fname?userr.fname:"-",
            City:userr.city?userr.city:"-",
            Mobile:userr.mobile?userr.mobile:"-",
            Password:userr.pass?userr.pass:"-",
         })
        })
   }
  
   csvStream.end();
   writeableStream.end();
     } catch (error) {
      
      res.status(401).json(error)
     }

})


module.exports = router;