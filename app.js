const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bcrypt = require("bcryptjs")
const {blogmodel} = require("./models/blog")
const jsonwebtoken = require("jsonwebtoken")

const app = express()
app.use(cors())
app.use(express.json())
mongoose.connect("mongodb+srv://adarshp:beenasadu@cluster0.6nnmmnj.mongodb.net/blogapp?retryWrites=true&w=majority&appName=Cluster0")


const generatehashedpassword = async (password)=>{
    const salt = await bcrypt.genSalt(10)  //genarating salt value
    return bcrypt.hash(password,salt) //conerting password to the hash value,await is used to call the asynch

}

app.post("/signup", async(req,res)=>{ // using asynch to call another async
    let input = req.body

    let hashedpassword  = await generatehashedpassword(input.password)
    console.log(hashedpassword)
    input.password = hashedpassword//append the hashed oassword into the input or it will be in plaine
    let blog = new blogmodel(input)
    blog.save()

    
    res.json({"status":"success"})
})
app.post("/signin",(req,res)=>{
    let input = req.body
    blogmodel.find({"emaild":req.body.emaild}).then(
        (response)=>{
            if (response.length > 0) { //checking the inserted password and dbpasswordarray the use console to check if its working before declaring the dbpassword variable
                let dbpassword = response[0].password
                console.log(dbpassword)
                bcrypt.compare(input.password,dbpassword,(error,ismatch)=>{
                    if (ismatch) {
                        
                        jsonwebtoken.sign({emaild:input.emaild},"blog-app",{expiresIn:"1d"},
                            (error,token)=>{
                                if (error) {
                                    res.json({"status":"unable to create token"})
                                    
                                    
                                } else {
                                    res.json({"status":"success","userid":response[0]._id,"token":token})
                                    
                                    
                                }
                            }
                        )
                        
                    } else {
                        res.json({"status":"incorrect"})
                        
                    }
                    
                })
                
            } else {
                res.json({"status":"success"})
                
            }
        }
    ).catch()
    
    
    
    
})
app.listen(8080,()=>{
    console.log("server started")
})