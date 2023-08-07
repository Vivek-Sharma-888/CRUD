const multer =require("multer")

const Store =multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,`./uploads`)
    },
    filename:(req,file,cb)=>{
       cb(null,`image_${Date.now()}_${file.originalname}`)
    }
})

const isImage = (req,file,cb)=>{
if(file.mimetype.startsWith("image")){
cb(null,true)
}else{
    cb(new Error("Only image is allowed"))
}

}



const upload = multer({
    storage:Store,
    fileFilter:isImage
})

module.exports=upload;