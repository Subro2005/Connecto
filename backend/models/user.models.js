import mongoose from "mongoose"

const userSchema= new mongoose.Schema(
    {
        name:{
            type:String,
            required:true
        },
        username:{
            type:String,
            required:true,
            unique:true
        },
        email:{
            type:String,
            required:true,
            unique:true
        },
        password:{
            type:String,
            required:true,
            select:false
        },
        bio:{
            type:String,
            default:""
        },
        
        profileimage:{
            type:String,
            default:""
        },
        profileimageppublicid:{
            type:String,
            default:""
        },
        followers:{
           type: mongoose.Schema.Types.ObjectId,
                ref: "user"
        },
        following:{
            type: mongoose.Schema.Types.ObjectId,
                ref: "user"
        },
        savedposts:{
            type: mongoose.Schema.Types.ObjectId,
                ref: "post"
        },
        refreshtokens:{
            type:String,
            defaut:""
        }
    
    },
    {
        timestamps:true
    }
)


const user =mongoose.model("user",userSchema)


export default user