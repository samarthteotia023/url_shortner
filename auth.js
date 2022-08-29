const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer= require("nodemailer");
const randomstring= require("randomstring");
const config = require("../config/config")

const create_token= (async (id)=>{
  try{
    const token= await jwt.sign({_id:id},config.secret_jwt);
    return token;
  }catch(error){
    res.status(400).send(error.message);
  }
})

//REGISTER
router.post("/register", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPass,
    });

    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    !user && res.status(400).json("Wrong credentials!");

    const validated = await bcrypt.compare(req.body.password, user.password);
    !validated && res.status(400).json("Wrong credentials!");

    const { password, ...others } = user._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});


const sendresetmail= async(name, email , token)=>{
  try{
    const transpoter= nodemailer.createTransport({
      host:'smtp.gmail.com',
      port:587,
      secure:false,
      requireTLS:true,
      auth:{
        user:config.emailUser,
        user:config.emailPassword
      }
    });

    const mailoptions= {
      from:config.emailUser,
      to:email,
      subject:'for reset password',
      html:'<p> hii '+name+ ', Please copy the link and <a href="http://127.0.0.1:3000/api/forget?token='+token+'">  reset you password</a>'


    }
    transpoter.sendMail(mailoptions,function(error,info){
      if(error){
        console.log(error);
      }
      else{
        console.log("mail has been sent",info.response);
      }
    })

  }catch(err){
    res.status(400).json(err);
  }
}
//FORGET PASSWORD
router.post("/forget",async (req,res)=>{
  try{
       const email= req.body.email;
       const userdata= await User.findOne({email:email});
       if(userdata){
        const Randomstring = randomstring.generate();
         const data=User.updateOne({email:email}, {$set:{token:Randomstring}}); 
         sendresetmail(userdata.name,userdata.email,Randomstring);
         res.status(200).send({success:true,msg:"check your inbox"});

       }else{
        res.status(200).send({success:true,msg:"this email does not exis"})
       }

  }catch (err){
    res.status(400).json(err);
  }
})
module.exports = router;