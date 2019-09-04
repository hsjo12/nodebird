const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const {User} = require('../models/index');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

const router = express.Router();

// router.get(미들워에1 미들워어2 미들웨어3) 이런식으로 미들웨어를 인라인식으로 쓸수 있는데,
//post도 같은형식이면, isNotLoggedIn ,async (req,res,next) e두개의 미들웨어 사용중.
// 첫 타자로 isNotloggiIn이 성공이면 Next()를 보내어 다음 미들웨어로 보낸다...
//POST /auth/join
router.post('/join',isNotLoggedIn ,async (req,res,next) =>{
    const {email, nick,password} = req.body; // 비밀번호가 req.body에 들어가서 전달.
    try{
        console.log(req.body)

        const exUser = await User.findOne({ where: { email } });
        if(exUser){ // 가입된 이메일이 있다면.
            req.flash('joinError', '이미 가입된 이메일입니다.')
            return res.redirect('/join') // 리다이렉...
        }

        console.time('암호화 시간');
        const hash = await bcrypt.hash(password,12);// 숫자가 높을수록 암호화 강도가 올라가고 시간 소요가 더듬. 
        // 시간 1 초정도 암호화하는게 좋음
        console.timeEnd('암호화 시간');
        
        //db 에 저장.
        await User.create({
            email,
            nick,
            password: hash
        });
    
        return res.redirect('/'); // 가입시 메인 페이지로.
    }catch(e){
        console.error(e);
        next(e);
    }
});


//POST /auth/login
router.post('/login',isNotLoggedIn,(req,res,next)=>{ //req.body.email req.body.password
    passport.authenticate('local',(authError,user,info)=>{ 
            // done(에러,성공,실패)가 (authError,user,info)= 전달됩니다. 
            // 그래서 done 에서 에러가 낫을시 authError 에, done 에서 성공시 user에, done 에서 실패시 info에
        if(authError) { // done(유저가 입력한 정보에서, localstrategy)에서 에러가 낫을시 
            console.error(authError);
            return next(authError); //에러날시 에러전용 미들웨어로
        }
        if(!user){ // 유저정보가 없을때, 즉 done 에서 실패시... 
            req.flash('loginError', info.message);
            return res.redirect('/')
        }
        return req.logIn(user,(loginError)=>{ // 패스포트에서 알아서함.//유저정보가 있을때, 즉 done에서 성공시// 세션에 저장이됨 그러고 나서 로그인후 req.user로 접근가능.
       
            if(loginError){ // req.로그인에서 희박하게 날 수도있기에... 
                console.error(loginError);
                return next(loginError);
            }

        return res.redirect('/');
        });
        })(req,res,next);
});

router.get('/logout', isLoggedIn, (req, res) => {
    req.logout(); // 패스포트에서 알아서함.
    req.session.destroy();// req.user지움. 로그인시 req.user 생기는데,  // 는 세션을 지웁니다(사실 로그아웃시에에는 안해도됩니다, 다른 세션도 같이 지워지기때문예요)
    res.redirect('/');
  });

  
// 카카오톡은 따로 회원가입이 없다.
//1
  router.get('/kakao',passport.authenticate('kakao')); //passport.authenticate('kakao')는 kakaoStrategy를 부르고,  
 //3
  router.get('/kakao/callback',passport.authenticate('kakao',{
    failureRedirect:'/', //실패시, 메인다이렉트로
     }), (req, res )=>{ // 성공시,
         res.redirect('/');
     }) // kakaoStrategy.js의 callbackURL과 같아야함 // kakaoStrategy는 인자들을 이 콜백함수를 넘긴다.
  
module.exports = router;

//1 
//passport.authenticate('kakao')는 kakaoStrategy를 부르고,  

//2
// passport.use(new KakaoStoragy({
//    clientID:'process.env.KAKAO_ID',//카카오 앱 아이디
//이게 실행되어서, 카카오 서버 로그인 요청함.
//로그인 요청된 정보를 이리로 보냄
//callbackURL:'/auth/kakao/callback' // 카카오 리다이렉트 주소 (카카오 콜백받을 주소 or 라우터( 즉 여기로 프로필 반환) )

//3
//router.get('/kakao/callback' 가 작동해서 받고
//passport.authenticate('kakao',{ 이거를 실행하면.

//4
//async(accessToken, refreshToken, profile, done)=>{ 
//이 콜백을 넘겨준다,
//넘겨준후
//  failureRedirect:'/', //실패시, 메인다이렉트로
// }), (req, res )=>{ // 성공시,
//     res.redirect('/');
// }) // kak
//이거 실행.