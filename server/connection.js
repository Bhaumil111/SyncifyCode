const mongoose = require("mongoose");


//connection
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(()=>{
    console.log("connection successful");
}).catch((err)=>{
    console.log(err);
})