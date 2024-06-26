const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req,res,next){
    const token = req.header('x-auth-token');

    //Check if not token
    if(!token){
        return res.status(401).json({ msg:'No Token, Authorization denied'})
    }

    try{
        const decoded = jwt.verify(token,config.get('jwtSecret'));
        req.user = decoded.user;
        next();
    }
    catch(err){
        console.log(err.message);
        return res.status(401).json({ msg : 'Invalid Token'});
    }

}