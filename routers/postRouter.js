const express = require('express')
const { isAuth, getUserSpecificData } = require('../utils.js')
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
    const datas = await getUserSpecificData(req)
    var posts = null
    if(datas.user){
        posts = await Post.find({$or:[{posted:true,showTo:{"$in":[datas.user._id]}},{posted:true,userId:datas.user._id}]}).sort('-updatedAt').select('_id user title description youtubeId files likes createdAt commentCount userId')
    }else{
        posts = await Post.find({posted:true}).select('_id user title description youtubeId files likes createdAt commentCount userId')
    }
    res.send(posts)
})

postRouter.get('/create',isAuth, async(req,res)=>{
    const posts = await Post.find({userId:req.user._id,posted:false})
    if(posts.length != 0){
         res.send(posts[0])
    }else{
        const user = await User.findById(req.user._id)
        const post = new Post({
            user:{
                name:user.name,
                avatar:user.avatar
            },
            userId:req.user._id,
            showTo:user.friends
        })
        const savedPost = await post.save()
        res.send(savedPost)
        
    }
})

postRouter.get('/:p_id',async(req,res)=>{
    const post_id = req.params['p_id']
    const post = await Post.findById(post_id)
    res.send(post)
})

postRouter.get('/like/:p_id',isAuth,async(req,res)=>{
    const post_id = req.params['p_id']
    const post = await Post.findById(post_id)
    var index = post.likes.indexOf(req.user._id);
    if (index > -1) {
        post.likes.splice(index, 1);
    }
    else post.likes.push(req.user._id)
    await post.save()
    res.send(post)
})

postRouter.post('/update/:p_id',isAuth, async(req,res)=>{
    const post_id = req.params['p_id']
    const post = await Post.findById(post_id)
    if(post.userId == req.user._id){
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
    }
    res.send({"post":post})
})

postRouter.get('/comments/:p_id',async(req,res)=>{
    const p_id = req.params['p_id']
    var post = await Post.findById(p_id)
    if(!post.comments){
        post.comments = []
    }
    res.send(post.comments)
})

postRouter.post('/add_comment/:p_id',isAuth,async(req,res) => {
    const p_id = req.params['p_id']
    var post = await Post.findById(p_id)
    const user = await User.findById(req.user._id)
    const data = req.body
    var comment = {
        userId:user.userId,
        name:user.name,
        avatar:user.avatar,
        content:data.content
    }
    if(!post.comments){
        post.comments = []
    }
    post.comments=[...post.comments,comment]
    post.commentCount = post.comments.length
    await post.save()
    res.send(post.comments)
})

postRouter.get('/delete_comment/:p_id/:c_id',isAuth,async(req,res)=>{
    const p_id = req.params['p_id']
    const c_id = req.params['c_id']
    var post = await Post.findById(p_id)
    const index = post.comments.findIndex(comment=>comment._id.toString() === c_id)
    if (index>-1){
        post.comments.splice(index,1)
    }
    post.commentCount = post.comments.length
    await post.save()
    res.send(post.comments)
})

module.exports = postRouter