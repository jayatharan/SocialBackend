const mongoose = require('mongoose')
const Schema = mongoose.Schema

const contactInfoSchema = mongoose.Schema({
    tel:[String],
    visible:{type:Boolean,default:false}
})

const userSchema = new Schema(
    {
        name:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true,
            unique:true
        },
        avatar:{
            type:String,
            required:true
        },
        updated:{
            type:Boolean,
            default:false
        },
        userType:{
            type:String,
            enum:['Student','Teacher','School','Admin']
        },
        medium:{
            type:String,
            enum:['Tamil','Sinhala','English']
        },
        district:{
            type:String,
            enum:['Vavuniya','Colombo','Mannar']
        },
        grade:{
            type:String
        },
        contact:contactInfoSchema,
        friends:[{
            type: Schema.Types.ObjectId, 
            ref: 'User'
        }]
    },
    {
        timestamps:true
    }
)

const User = mongoose.model('User',userSchema)

module.exports = User