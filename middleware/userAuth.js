import jwt from 'jsonwebtoken';

export const userAuth = async(req,res,next)=>{
    const {token} = req.cookies;

    if(!token){
        return res.status(401).json({
            message : "unauthorized user,please login first,token not found"
        })
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(decoded.id){
            req.userId = decoded.id;
            console.log("User ID: ",req.userId);
        }
        else{
            return res.status(401).json({
                message : "unauthorized user,please login first, wrong token"
            })
        }

        next();
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            message : "Internal server error"
        })
    }
}