import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
        name :{
            type : String,
            required : true,
            trim : true,

        },
        email : {
            type : String,
            required : true,
            unique : true,
            trim : true,
        },
        password : {
            type : String,
            required : true,
            trim : true,
        },
        isVerified : {
            type : Boolean,
            default : false,
        },

        resetOtp : {
            type : String,
            default : "",
        },

        resetOtpExpiry : {
            type : Number,
            default : 0,
        },

        verifyOtp : {
            type : String,
            default : "",
        },

        verifyOtpExpiry : {
            type : Number,
            default : 0,
        }

})

const userModel = mongoose.model('user',userSchema)

export default userModel;