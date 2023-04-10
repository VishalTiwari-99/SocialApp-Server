const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const conversationsRoute = require("./routes/conversations");
const messagesRoute = require("./routes/messages");
const cors = require("cors");
const multer  = require('multer');
const path = require("path");
const bodyParser = require("body-parser");

dotenv.config();

mongoose.connect(process.env.MONGO_URL, {useNewUrlParser: true}).then(()=>{
    console.log("Connected to MongoDB server");
}).catch((err)=>{
    console.log(err);
})

app.use("/images", express.static(path.join(__dirname, "public/images")));

//middlewares
app.use(cors());

app.use(express.json()); //for parsing req with header-type "applicaiton/json"
app.use(bodyParser.urlencoded({ extended: true }));

app.use(helmet());
app.use(morgan("common"));

const storage = multer.diskStorage({
    destination:(req, file, cb) => {
        cb(null, "public/images");
    },
    filename: (req, file, cb) => {
        cb(null, req.body.name);
    },
})

const upload = multer({storage});
app.post("/api/upload", upload.single("file"), (req, res) => {
    try{
        return res.status(200).json("File uploaded successfully");
    }catch(err){
        console.log(err);
    }
})

app.use("/api/users", userRoute)
app.use("/api/auth",authRoute)
app.use("/api/post", postRoute)
app.use("/api/conversations", conversationsRoute)
app.use("/api/messages", messagesRoute)

app.listen(4000, ()=> {
    console.log("Backend server is running!");
})