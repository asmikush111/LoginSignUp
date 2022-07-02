const jwt=require('jsonwebtoken');
const Register=require('../models/registers');

const auth=async(req,res,next)=>{
    try{
        const token=req.cookies.jwt;
        const verifyuser=jwt.verify(token,process.env.SECRET_KEY);
        
        const user=await Register.findOne({_id:verifyuser._id});
        console.log(user.firstname);
        req.token=token;
        req.user=user;

        next();
    }
    catch(e)
    {
        res.status(401).send(e);
    }
}
module.exports=auth;