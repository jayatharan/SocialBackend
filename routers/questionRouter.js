const express = require('express')
const { isAuth, getUserSpecificData } = require('../utils.js')
const User = require('../models/userModel')
const Question = require('../models/questionModel')

const questionRouter = express.Router()

questionRouter.get('/', async(req,res)=>{
    const datas = await getUserSpecificData()
    const questions = await Question.find()
    res.send(questions)
})

questionRouter.get('/create',isAuth,async(req,res)=>{
    const questions = await Question.find({userId:req.user._id,asked:false})
    if(questions.length != 0){
        res.send(questions[0])
    }else{
        const user = await User.findById(req.user._id)
        const question = new Question({
            user:{
                name:user.name,
                avatar:user.avatar
            },
            userId:req.user._id,
        })
        const savedQuestion = await question.save()
        res.send(savedQuestion)
    }
})

module.exports = questionRouter