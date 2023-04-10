const router = require("express").Router();
const User = require("../models/Users");
const bcrypt = require("bcrypt");

// update a user
router.put("/:id", async (req,res) => {
    if(req.body.userId === req.params.id || req.body.isAdmin){
        if(req.body.password){
            try{
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            }catch(err){
                return res.status(500).json(err);
            }
        }
        try{
            const user = await User.findByIdAndUpdate(req.params.id, {
                $set:req.body
            });
            res.status(200).json("Account updated successfully"); 
        }catch(err){
            return res.status(500).json(err);
        }
    }else{
        return res.status(403).json("You can update only your account");
    }
})

//delete a user
router.delete("/:id", async (req, res) => {
    if(req.body.userId === req.params.id || req.body.isAdmin){
        try{
            const user = await User.findOne({_id:req.params.id});
            !user && res.status(404).json("User not found.")

            const validPassword = await bcrypt.compare(req.body.password, user.password);
            !validPassword && res.status(400).json("Incorrect user password!");

            if(validPassword){
                await User.deleteOne({_id:req.params.id}).then((user)=>{
                    console.log(user + "Deleted Successfully");
                    res.status(200).json("User Deleted Successfully.");
                }).catch((err)=>{
                    res.status(500).json(err);
                })
            }
        }catch(err){
            res.status(500).json(err);
        }

    }else{
        return res.status(403).json("Delete access is not provided you.");
    }
})

//get a user (through id)
router.get("/", async (req, res) => {
    const userId = req.query.userId;
    const username = req.query.username;

    try{
        const user = userId ? await User.findById(userId) : await User.findOne({username: username});
        const {password, updatedAt, ...other} = user._doc;
        res.status(200).json(other);
    }catch(err){
        res.status(500).json(err);
    } 
});

//get all friends(followings) of a user
router.get("/friends/:userId", async (req, res)=>{
    try{
        const user = await User.findById(req.params.userId);
        const friends = await Promise.all(
            user.followings.map(friendId => {
                return User.findById(friendId);
            })
        )
       let friendList = [];
       friends.map(friend => {
        const {_id, username, profilePicture} = friend;
        friendList.push({_id, username, profilePicture});
       });
       res.status(200).json(friendList);
    }catch(err){
        res.status(500).json(err);
    }
})


//follow a user
router.put("/:id/follow", async (req, res) => {
    if(req.body.userId !==req.params.id){
        try{
            const user = await User.findById(req.params.id);
            const currUser = await User.findById(req.body.userId);
            if(! user.followers.includes(req.body.userId)){
                await user.updateOne({$push: {followers: req.body.userId}});
                await currUser.updateOne({$push: {followings: req.params.id}});
                res.status(200).json("you are following this user now.");
            }else{
                res.status(403).json("you already follow this user!");
            }

        }catch(err){
            res.status(500).json(err);
        }
    }else{
        res.status(403).json("You can't follow yourself.")
    }
})

//unfollow a user
router.put("/:id/unfollow", async (req, res) => {
    if(req.body.userId !==req.params.id){
        try{
            const user = await User.findById(req.params.id);
            const currUser = await User.findById(req.body.userId);
            if(user.followers.includes(req.body.userId)){
                await user.updateOne({$pull: {followers: req.body.userId}});
                await currUser.updateOne({$pull: {followings: req.params.id}});
                res.status(200).json("you are unfollowing this user now.");
            }else{
                res.status(403).json("you don't follow this user!");
            }

        }catch(err){
            res.status(500).json(err);
        }
    }else{
        res.status(403).json("You can't unfollow yourself.")
    }
})

module.exports = router