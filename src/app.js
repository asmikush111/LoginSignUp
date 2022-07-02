require('dotenv').config();
const express=require("express");
const path=require('path');
const hbs=require('hbs');
const app=express();
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const cookieParser=require('cookie-parser');
const auth=require('./middleware/auth');

require('./db/conn');

const port=process.env.PORT || 8000;

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:false}));

const static_path=path.join(__dirname,'../public');
app.use(express.static(static_path));

app.set("view engine","hbs");

const templates_path=path.join(__dirname,'../templates/views');
app.set('views',templates_path);

const partials_path=path.join(__dirname,'../templates/partials');
hbs.registerPartials(partials_path);

const Register=require('./models/registers');


app.get("/",(req,res)=>{
    res.render('index');
})

app.get("/successful",auth,(req,res)=>{
    res.render("successful");
})

app.get("/logout",auth,async (req,res)=>{
   try{
   /*///single logout 
    req.user.tokens=req.user.tokens.filter((cur)=>{
         return cur.token!=req.token
    })*/
    req.user.tokens=[];

    res.clearCookie("jwt");
    await req.user.save();
    res.render("index");
   }
   catch(e)
   {
    res.status(500).send(e);
    console.log(e);
   }
    
})


app.post("/register",async(req,res)=>{
    try{
       const password=req.body.password;
       const confirmpassword=req.body.confirmpassword;
       if(password==confirmpassword)
       {
          const registerEmployee= new Register({
            firstname:req.body.firstname,
            lastname:req.body.lastname,
            email:req.body.email,
            password:password,
            confirmpassword:confirmpassword
          })

         // const token=await registerEmployee.generateAuthToken();
         // res.cookie("jwt",token,{});
         
          const registered=await registerEmployee.save();
          res.status(201).render('index');
          
       }
       else console.log("passwords are not same");
    }
    catch(e){
        res.status(400).send(e);
    }
})


app.post("/login",async (req,res)=>{
  
try{  
     const email=req.body.email;
     const password=req.body.password;
     const userdata=await Register.findOne({email});
     const ismatch= await bcrypt.compare(password,userdata.password);
     
     const token=await userdata.generateAuthToken();
     res.cookie("jwt",token,{});

     
     if(ismatch===true){
        res.status(200).render("successful",{token});
     }
     else res.send("Either email or password is wrong");
   }
   catch(e)
   {
    res.status(400).send("invalid login details");
   }
})


app.get("/user",async (req,res)=>{
    try{
        const userData =await Register.find();
        res.send(userData);
    }
    catch(e){ res.send(e);}
})

app.get("/user/:id",async (req,res) =>{
    try{
        const _id=req.params.id;
        const userData=await Register.findById(_id);
        if(!userData){ return res.status(404).send(); }
        else { res.send(userData); }
    }
    catch(e){
        res.send(e);
    }
})

app.put("/user/:id",async (req,res)=>{
    try{
        const _id=req.params.id;
        const userData=await Register.findByIdAndUpdate(_id,req.body,{ new:true});
        res.send(userData);
    }
    catch(e){
        res.status(400).send(e);
    }
})

app.delete("/user/:id",async (req,res)=>{
    try{
        const id=req.params.id;
        const userData=await Register.findByIdAndDelete(id);
        if(!id){return res.status(400).send();}
        res.send(userData);
    }
    catch(e){
        res.status(500).send(e);
    }
})

app.listen(port);



















