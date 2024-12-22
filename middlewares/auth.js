const isLogin = async(req ,res , next)=>{
    try {
        if (req.session.user) {
            return next(); 
        }
        return res.redirect('/auth/login');
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error amd '+ error.message,
        });
    }
}
const isLogout = async(req ,res , next)=>{
    try {
        if (!req.session.user) {
            return next(); 
        }
        return res.redirect('/auth/dashboard');
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error amd '+ error.message,
        });
    }
}

module.exports = {
    isLogin,
    isLogout
}