const User = require('./models/userModel')
const Post = require('./models/postModel')
const FriendRequest = require('./models/friendRequestModel')

const jwt = require('jsonwebtoken')

const generateToken = (user) => {
    const token = jwt.sign(
        {
            _id:user._id,
        },
        'jwtsecret',
        {
            expiresIn: '30d',
        }
    )
    return token;
}

const isAuth = (req,res,next) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.slice(7, authorization.length); // Bearer XXXXXX
    jwt.verify(
      token,
      'jwtsecret',
      (err, decode) => {
        if (err) {
          res.status(401).send({ message: 'Invalid Token' });
        } else {
          req.user = decode;
          next();
        }
      }
    );
  } else {
    res.status(401).send({ message: 'No Token' });
  }
}

const updatePostShowto = async(userId)=>{
  const user = await User.findById(userId)
  await Post.updateMany({userId:userId},{'$set':{
    showTo:user.friends
  }})
}

const updateFriendOfUser = async(userId,friendId)=>{
  const user = await User.findById(userId)
  user.friends.push(friendId)
  await user.save()
}

const removeFriendOfUser = async(userId,friendId)=>{
  var user = await User.findById(userId)
  var friends = user.friends
  const index = friends.findIndex(id => id.toString() === friendId)
  if(index > -1){
    friends.splice(index,1)
    user.friends = friends
    await user.save()
  }
}

const getUserSpecificData = async(req)=>{
  var userType = "All"
  var medium = "All"
  var grade = "All"
  var user = null

  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.slice(7, authorization.length);
    await jwt.verify(
      token,
      'jwtsecret',
      async(err, decode) => {
        if (err) {
          user = null
        } else {
          user = await User.findById(decode)
          userType = user.userType
          medium = user.medium
          grade = user.grade
        }
      }
    );
  }
  return {userType,medium,grade,user}
}

const getMyRequestedIds = async(userId)=>{
  requests = await FriendRequest.find({fromUserId:userId}).select('toUserId')
  toIds = []
  requests.map((request)=> toIds.push(request.toUserId) )
  return toIds
}

module.exports = { generateToken, isAuth, updatePostShowto, updateFriendOfUser, getUserSpecificData, getMyRequestedIds, removeFriendOfUser }