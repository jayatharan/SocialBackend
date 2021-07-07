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


module.exports = { generateToken, isAuth, updatePostShowto }