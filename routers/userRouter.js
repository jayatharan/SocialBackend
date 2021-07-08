const express = require('express')
const { OAuth2Client } =require('google-auth-library')
const User = require('../models/userModel')
const { generateToken, isAuth, getUserSpecificData, getMyRequestedIds } = require('../utils.js')

const userRouter = express.Router()

const client = new OAuth2Client("1024970411628-b4s6qus2bui9efecamg85p7e1t9unnsg.apps.googleusercontent.com")


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
    }})
    
    res.send(friends)
})

userRouter.get('/search',async(req,res)=>{
    const datas = await getUserSpecificData(req)
    var people = null
    var requestedIds =[]
    if(datas.user){
        var friends = datas.user.friends
        requestedIds = await getMyRequestedIds(datas.user._id)
        if(friends.length != 0){
            people = await User.find({updated:true,_id:{$nin:friends}}).limit(50)
            people = people.filter((person) => person._id.toString() != datas.user._id.toString())
        }else{
            people = await User.find({updated:true})    
            people = people.filter((person) => person._id.toString() != datas.user._id.toString())
        }
    }else{
        people = await User.find({updated:true})
    }
    res.send({people,requestedIds})
})



module.exports = userRouter
