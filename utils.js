const User = require('./models/userModel')
const Post = require('./models/postModel')

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


module.exports = { generateToken, isAuth, updatePostShowto, updateFriendOfUser, getUserSpecificData }