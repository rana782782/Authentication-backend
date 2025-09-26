import userModel from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import transporter from '../config/nodemailer.js'; 


export const register = async(req,res)=>{
    const {name,email,password} = req.body;

if(!name || !email || !password){
    return res.status(400).json({message : "All fields are required"});
}

try{
    const existingUser = await userModel.findOne({email});

    if(existingUser){
        return res.status(400).json({
            message : "user already exists with this email"
        })
    }
    const hashedPassword = await bcrypt.hash(password,10);

   const newUser = await userModel.create({
    name,
    email,
    password: hashedPassword
});


    const token = jwt.sign({id : newUser._id},process.env.JWT_SECRET,{expiresIn : '1d'});
    res.cookie('token',token);

    //email configuration
    const mailOptions = {
        from : process.env.SENDER,
        to : email,
        subject : "welcome to mern authntication app",
        text : `Hello ${name}, welcome to our application! Your registration was successful.`
    }

    const info = await transporter.sendMail(mailOptions);
    try{
        console.log("Email sent: " + info.response);
    }
    catch(error){
        console.error("Error sending email: ", error);
    }

  return res.status(201).json({
        message : "user registered successfully",
    })
}

 catch(error){
        console.log(error);
        res.status(500).json({
            message : "Internal server error"
        })
    }
}


export const login = async(req,res)=>{
    const{email,password} = req.body;

    if(!email || !password){
        return res.status(400).json({
            message : "all fields are required",
        })
    }

    try{
            const user = await  userModel.findOne({email})
            if(!user){
                return res.status(400).json({
                    message : "user not found with this email",
                })
            }

            const isPasswordValid = await bcrypt.compare(password,user.password);
            if(!isPasswordValid){
                return res.status(400).json({
                    message : "invalid credentials",
                })
            }

            const token = jwt.sign({id : user._id},process.env.JWT_SECRET,{expiresIn : '1d'});

            res.cookie('token',token);
            return res.status(200).json({
    message: "User logged in successfully",
    user: {
        id: user._id,
        name: user.name,
        email: user.email
    }
});

    }
    catch(error){
        console.log(error);
        res.status(500).json({
            message : "Internal server error"
        })
    }
}

export const logout = async(req,res)=>{
    try{
     res.clearCookie('token');

        return res.status(200).json({
            message : "user logged out successfully",
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            message : "Internal server error",
        })
    }
}


export const sendVerifyOtp = async(req,res)=>{
    try{
          
          console.log("Received verify fxn:", req.userId);

          const user = await userModel.findOne({ _id: req.userId });

          if(user.isVerified){
            return res.status(400).json({
                message : "user already verified"
            })
          }

          const otp = Math.floor(100000+Math.random()*900000).toString();
        const expiry = Date.now()+5*60*1000;

        user.verifyOtp = otp;
        user.verifyOtpExpiry = expiry;
        await user.save();
        const mailOptions = {
            from : process.env.SENDER,
            to : user.email,
            subject : "Verify your email",
            text : `your verification code is ${otp}, valid for 5 minutes.`
        }

        const info = await transporter.sendMail(mailOptions);
        try{
            console.log("Email sent: " + info.response);
            return res.status(200).json({
                message : "verification otp sent successfully"
            })
        }
    catch(error){
        console.error("Error in sending email: ", error);
    }
}
catch(error){
            console.log(error);
            res.status(500).json({
                message : "internal server error"
            })
    }
}

export const verifyEmail = async(req,res)=>{
    const {otp} = req.body;
    console.log("Received body:", req.body);

    if(!req.userId || !otp){
        return res.status(400).json({
            message : "all fields are required"
        })
    }

    try{

        const user = await userModel.findOne({ _id: req.userId });
        if(!user){
            return res.status(400).json({
                message : "user not found"
            })
        }

        if(user.isVerified){
            return res.status(200).json({
                message : "user already verified"
            })
        }

        if(user.verifyOtp!==otp){
            return res.status(400).json({
                message : "invalid otp"
            })
        }

        if(user.verifyOtpExpiry<Date.now()){
            return res.status(400).json({
                message : "otp expired"
            })
        }

        user.isVerified = true;
        user.verifyOtp = "";
        user.verifyOtpExpiry = 0;
        await user.save();

        return res.status(400).json({
            message : "user verified successfully"
        })
    }
    catch(error){
        console.log(error);
        res.status(500).json({
            message : "Internal server error"
        })
    }
}

export const resetPasswordOtp = async(req,res)=>{
    const {email} = req.body;

    if(!email){
        return res.status(400).json({
            message : "enter email to reset password"
        })
    }

    const user = await userModel.findOne({email});

    if(!user){
        return res.status(400).json({
            message : "user not found with this email"
        })
    }

    const otp = Math.floor(100000+Math.random()*900000).toString();
    const expiry = Date.now()+5*60*1000;

    user.resetOtp = otp;
    user.resetOtpExpiry = expiry;

    await user.save();

    const mailOptions = {
        from : process.env.SENDER,
        to : user.email,
        subject : "Reset your password",
        text : `Your reset OTP is ${otp}, valid for 5 minutes.`
    }

    await transporter.sendMail(mailOptions)
        .then(info => {
            console.log("Email sent: " + info.response);
            return res.status(200).json({
                message : "Reset OTP sent successfully"
            });
        })
        .catch(error => {
            console.error("Error sending email: ", error);
            return res.status(500).json({
                message : "Error sending reset OTP"
            });
        });
}

export const resetPassword = async(req,res)=>{
    const {otp,newPassword} = req.body;

    if(!otp || !newPassword){
        return res.status(400).json({
            message : "all fields are required"
        })
    }

    const user = await userModel.findOne({_id: req.userId});
    if(!user){
        return res.status(400).json({
            message : "user not found"
        })
    }

    if(user.resetOtp!==otp){
        return res.status(400).json({
            message : "invalid otp"
        })
    }

    if(user.resetOtpExpiry<Date.now()){
        return res.status(400).json({
            message : "otp expired"
        })
    }

    user.password = await bcrypt.hash(newPassword,10);
    user.resetOtp = "";
    user.resetOtpExpiry = 0;
    await user.save();

    return res.status(200).json({
        message : "password reset successfully"
    })
}