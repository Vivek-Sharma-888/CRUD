const mongoose =require('mongoose')


mongoose.connect(process.env.DB,{
    useUnifiedTopology:true,
    useNewUrlParser:true
}).then(()=>console.log('Database Connected')).catch(()=>console.log("Not Connected"))