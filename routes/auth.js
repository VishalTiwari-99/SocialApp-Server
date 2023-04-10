const router = require("express").Router();
const User = require("../models/Users");
const bcrypt = require("bcrypt");

//Register new user
router.post("/register",async (req,res)=>{
    try{
        //generating password hash
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        //creating user
        const newUser = await new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            isAdmin: req.body.isAdmin
        })
        //saving user in db and returing response
        const user = await newUser.save();
        res.status(200).json(user);
    }catch(err){
        res.status(500).json(err);
    }
})


//Login
router.post("/login", async (req, res)=> {
    try{
        const user = await User.findOne({email:req.body.email})
        !user && res.status(404).json("User not found");

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        !validPassword && res.status(400).send("Incorrect Password!");
        if(!validPassword){
            return;
        }

        res.status(200).json(user);
    }catch(err){
        res.status(500).json(err);
    }
})

module.exports = router