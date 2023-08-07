const mongoose =require('mongoose')
const DB = 'mongodb+srv://vivek:sGSTIaYZLAH4JKKN@vivekapi.mnnxrsq.mongodb.net/VivekApi?retryWrites=true&w=majority';

mongoose.connect(DB,{
    useUnifiedTopology:true,
    useNewUrlParser:true
}).then(()=>console.log('Database Connected')).catch(()=>console.log("Not Connected"))