const Post = require('./../model/post-mode');

class AuthMiddleware {
    checkUser = async(req, res, next)=>{
        try {
            const session = req.headers.session;
            
            if(!session) return res.status(401).json({
                status: 401,
                message: 'you must login to access this resource'
            })
            req.user = JSON.parse(session);
            next();
        } catch(err) {
            res.status(500).json({
                status: 500,
                message: 'server was interval'
            })
        }
    }
    checkAuthorOfPost = async(req, res, next)=>{
        try {
            const session = req.headers.session;
            if(!session) return res.status(401).json({
                status: 401,
                message: 'you must login to access this resource'
            })

            const user = JSON.parse(session);

            //check if u already login or not
            if(!user) return res.status(401).json({
                status: 401,
                message: 'you are not on login state'
            })

            const {id} = req.params;
            console.log(id)

            const post = await Post.findOne({_id: id});

            //check if post exists
            if(!post) return res.status(400).json({
                status: 400,
                message: 'this post does not exist'
            })

            if(post.author._id !== user._id) return res.status(403).json({
                status: 403,
                message: 'you are not permission to access to this resource'
            })
            req.user = user;
            console.log(req.user)
            next();
        } catch(err) {
            res.status(500).json({
                status: 500,
                message: 'server was interval'
            })
        }
    }
}

module.exports = AuthMiddleware;