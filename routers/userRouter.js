const express = require('express')
const { OAuth2Client } =require('google-auth-library')
const User = require('../models/userModel')
const { generateToken, isAuth, getUserSpecificData, getMyRequestedIds, removeFriendOfUser, updatePostShowto } = require('../utils.js')

const userRouter = express.Router()

const client = new OAuth2Client("1024970411628-b4s6qus2bui9efecamg85p7e1t9unnsg.apps.googleusercontent.com")

userRouter.get('/my_data',isAuth,async(req,res)=>{
    const authorization = req.headers.authorization;
    const token = authorization.slice(7, authorization.length)
    const user = await User.findById(req.user._id)
    
    res.send({"user":user, "token":token})
})

userRouter.post('/login',(req,res)=>{
    const {tokenId} = req.body
    client.verifyIdToken({idToken:tokenId,audience:"1024970411628-b4s6qus2bui9efecamg85p7e1t9unnsg.apps.googleusercontent.com"})
    .then(response => {
        User.findOne({email:response.payload.email})
        .then((o_user) => {
            if(!o_user){
                const user = new User({
                    name:response.payload.name,
                    email:response.payload.email,
                    avatar:response.payload.picture
                })
                user.save()
                .then((result)=>{
                    res.send({"user":result,"token":generateToken(result)})
                })
                .catch((err)=>{
                    res.send(err)
                })
            }else{
                if(response.payload.picture == o_user.avatar){
                    res.send({"user":o_user, "token":generateToken(o_user)})
                }else{
                    o_user.avatar = response.payload.picture
                    o_user.save()
                    res.send({"user":o_user, "token":generateToken(o_user)})
                }
            }
        })
        .catch((err)=>{
                res.send(err)
        })
    })
    .catch((err)=>{
                res.send(err)
        })
})

userRouter.post('/update',isAuth,async (req,res)=>{
    const authorization = req.headers.authorization;
    const token = authorization.slice(7, authorization.length)
    const user = await User.findById(req.user._id)
    const data = req.body
    
    if(data.userType == "Student"){
    user.medium = data.medium
    user.grade = data.grade
    user.district = data.district
    user.updated = true
    user.userType = "Student"
    }

    await user.save()

    res.send({"user":user, "token":token})
})

userRouter.get('/my_friends',isAuth,async(req,res)=>{
    
    const user = await User.findById(req.user._id)
    const friends = await User.find({'_id':{
        $in: user.friends
    }}).select('_id name avatar userType').sort('name')
    
    res.send(friends)
})

userRouter.get('/un_friend/:f_id',isAuth,async (req,res)=>{
    const u_id = req.user._id
    const f_id = req.params['f_id']
    await removeFriendOfUser(u_id,f_id)

    //no need to wait untill bellow process finish (Background Process)
    removeFriendOfUser(f_id,u_id)
    updatePostShowto(u_id,f_id)
    updatePostShowto(f_id,u_id)
    //finish

    const authorization = req.headers.authorization;
    const token = authorization.slice(7, authorization.length)

    const user = await User.findById(u_id)

    res.send({"user":user, "token":token})
})

userRouter.get('/search/:keyword',async(req,res)=>{
    const keyword = req.params['keyword']
    const datas = await getUserSpecificData(req)
    var people = null
    
    var requestedIds =[]
    if(datas.user){
        var friends = datas.user.friends
        requestedIds = await getMyRequestedIds(datas.user._id)
        if(keyword === "none"){
            people = await User.find({updated:true,_id:{$nin:[...friends,...requestedIds]}}).sort('-updatedAt').limit(50).select('_id name avatar userType')
            people = people.filter((person) => person._id.toString() != datas.user._id.toString())
        }else{
            people = await User.find({ name: { $regex: keyword, $options: "i" }}).select('_id name avatar userType')
            people = people.filter((person) => person._id.toString() != datas.user._id.toString())
        }
    }else{
        if(keyword === "none"){
            people = await User.find({updated:true}).select('_id name avatar userType').limit(50)
        }else{
            people = await User.find({ name: { $regex: keyword, $options: "i" }}).select('_id name avatar userType')
        }
    }
    res.send({people,requestedIds})
})



module.exports = userRouter
