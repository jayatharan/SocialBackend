const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    name:String,
    avatar:String
})

const answerSchema = new Schema({
    userId:{
        type: Schema.Types.ObjectId, 
            ref: 'User'
    },
    user:userSchema,
    answer:String,
    youtubeId:{
            type:String
    },
    files:[{
            type:String
    }],
    description:{
            type:String,
    },
    postId:{
        type: Schema.Types.ObjectId, 
            ref: 'Post'
    },
    thumbsups:[
        {
        type: Schema.Types.ObjectId, 
            ref: 'User'
        }
    ]
})


const questionSchema = new Schema(
    {
        user:userSchema,
        question:{
            type:String,
        },
        userId:{
            type: Schema.Types.ObjectId, 
            ref: 'User'
        },
        avl:{
            type:Boolean,
            default:false
        },
        answers:[answerSchema],
        medium:String,
        district:String,
        grade:String,
        subjects:String,
        asked:{
            type:Boolean,
            default:false
        }
    },
    {
        timestamps:true
    }
)

const Question = mongoose.model('Question',questionSchema)

module.exports = Question