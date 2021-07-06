const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    name:String,
    avatar:String
})

const postSchema = new Schema(
    {
        user:userSchema,
        title:{
            type:String,
        },
        description:{
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
        posted:{
            type:Boolean,
            default:false
        },
        postType:{
            type:Number,
            default:0
        },
        youtubeId:{
            type:String
        },
        files:[{
            type:String
        }],
        report:[{
            com:{
                type:Schema.Types.ObjectId,
                ref: 'User'
            },
            content:String
        }],
        showTo:[{
            type:Schema.Types.ObjectId,
            ref: 'User'
        }]
    },
    {
        timestamps:true
    }
)

const Post = mongoose.model('Post',postSchema)

module.exports = Post