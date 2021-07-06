const express = require('express')
const { isAuth } = require('../utils.js')
const Post = require('../models/postModel')
const User = require('../models/userModel')

const postRouter = express.Router()

// postRouter.get('/my_posts',isAuth,async (req,res)=>{
//     const posts = await Post.find({userId:req.user._id,posted:true})
//     res.send({"Test":posts})
// })

postRouter.get('/my_posts',isAuth, async(req,res)=>{
    const posts = await Post.find({userId:req.user._id,posted:true})
    res.send(posts)
})

postRouter.get('/',async(req,res)=>{
    const posts = await Post.find({posted:true})
    res.send(posts)
})

postRouter.get('/create',isAuth, async(req,res)=>{
    const posts = await Post.find({userId:req.user._id,posted:false})
    if(posts.length != 0){
         res.send({"post_id":posts[0]._id})
    }else{
        const user = await User.findById(req.user._id)
        const post = new Post({
            user:{
                name:user.name,
                avatar:user.avatar
            },
            userId:req.user._id
        })
        post.save().then((result)=>{
            res.send({"post_id":result._id})
        })
    }
})

postRouter.get('/:p_id',async(req,res)=>{
    var post_id = req.params['p_id']
    const post = await Post.findById(post_id)
    res.send(post)
})


postRouter.post('/update/:p_id',isAuth, async(req,res)=>{
    var post_id = req.params['p_id']
    const post = await Post.findById(post_id)
    // if(post.userId != req.user._id) res.send({"Error":"You are not the owner"})
    const data = req.body
    post.title = data.title
    post.description = data.description
    post.youtubeId = data.youtubeId
    if(post.title && (post.youtubeId || post.description)){
        post.posted = true
    }else{
        await Post.deleteMany({_id:{$ne:post_id},userId:req.user._id,posted:false})
        post.posted = false
    }
    await post.save()
    res.send({"post":post})
})



module.exports = postRouter