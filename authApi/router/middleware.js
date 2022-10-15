const Auth = require('./../model/auth-model');

class AuthMiddleware {
    checkUser = async(req, res, next)=> {
        try {
            const {user} = req.session;
    
            //check if session exists
            if(!user) return res.status(403).json({
                status: 403,
                message: 'unAuthorization'
            })
    
            const _user = await Auth.findOne({_id: user._id});
    
            //check if user is fake 
            if(!_user) return res.status(403).json({
                status: 403,
                message: 'unAuthorization'
            })
    
            next();
        } catch(err) {
            return res.status(500).json({
                status: 500,
                message: 'server was interval'
            })
        }
    }

}

module.exports = AuthMiddleware;