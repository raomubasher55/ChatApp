const express = require('express');
const router = express();
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const path =require('path');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const session = require('express-session');
const  {SESSION_SECRET} = process.env;
const { register, registerLoad, loginLoad, login, logout, loadDashboard, saveChat, deleteChat, updateChat, loadGroup, createGroup, getMembers, addMember } = require('../controllers/userController');
const { isLogout, isLogin } = require('../middlewares/auth');


router.use(session({secret:SESSION_SECRET}));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:true}));
router.use(cookieParser());

router.set('view engine', 'ejs');
router.set('views', './views');

router.use(express.static('public'));

const storage = multer.diskStorage({
    destination:function(req ,file ,cb){
        cb(null , path.join(__dirname, '../public/images'))
    },
    filename:function(req , file ,cb){
        const name = Date.now()+'-'+file.originalname   
        cb(null ,name )
    }
})

const upload = multer({storage:storage});


router.get('/register' , isLogout ,  registerLoad);
router.post('/register' ,  upload.single('image'),  register);

router.get('/login', isLogout,loginLoad); 
router.post('/login', login); 

router.get('/dashboard',isLogin , loadDashboard);
router.post('/save-chat' , isLogin , saveChat);

router.delete('/delete-chat' , isLogin , deleteChat);
router.put('/update-chat' , isLogin , updateChat);


router.get('/group' , isLogin , loadGroup  );
router.get('/groups', (req, res) => {
    const groups = []; // Replace with logic to fetch groups from your database.
    res.render('group', {
        message: req.query.message || null, // Pass the message (if any) or null.
        groups, // Pass existing groups to the view.
    });
});

router.post('/groups/create' , isLogin , upload.single('image') ,createGroup  );
router.get('/groups/members' , isLogin  , getMembers  );
router.post('/groups/add-member', isLogin , addMember)

router.get('/logout' , isLogin ,logout)
module.exports = router;