import mongoose from "mongoose"
import dotenv from "dotenv"
import app from "./app.js"


dotenv.config({
    path:'./.env'
})

mongoose.connect(process.env.MONGODB_URI).then(()=>console.log("DATABASE CONNECTED")).catch((error)=>console.log("DATABASE CONNECTION FAILED",error))

app.listen(process.env.PORT || 7000, ()=>{
    console.log(`server is running at PORT:${process.env.PORT}`)

})