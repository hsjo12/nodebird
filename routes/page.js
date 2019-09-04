
//index.js파일이다.ㄴ
const express = require('express');
const router = express.Router();
const {isLoggedIn,isNotLoggedIn} = require('./middlewares');
const {Post,User} = require('../models');

//프로필 페이지
//isLoggedIn은 로그인 한 사람만 프로필 페이지로 접근가능 
// 여기에 미들웨어 가 두개 쓰인것, ,isLoggedIn 첫 미들웨어에서 로그인한지 보고,next() 익명함수 미들웨어로 넘겨줌
router.get('/profile', isLoggedIn,(req, res) => {
  res.render('profile', { title: '내 정보 - NodeBird', user: req.user }); // profile.pug 렌더링 ,있는 변수들
});

//회원가입 페이지
//isNotLoggedIn 로그인 안 한 사람만 회n원가입 페이지로 접근가능 
// 여기에 미들웨어 가 두개 쓰인것, ,isLoggedIn 첫 미들웨어에서 로그인안한지 보고,next() 익명함수 미들웨어로 넘겨줌
router.get('/join', isNotLoggedIn,(req, res) => {
  res.render('join', { // join.pug 렌더링
    title: '회원가입 - NodeBird', // join.pug에 있는 변수들
    user: req.user,  // 즉 done에서 성공시 in localStoragy 세션에 저장이됨 그러고 나서 로그인후 req.user로 접근가능.
    joinError: req.flash('joinError'), //일회성 메세지들 보여주기위해 에러 넣음 
  });
});

//메인 페이지
router.get('/', (req, res, next) => {
  Post.findAll({
    include: [
      // 작성자 정보 갖고오는것
      {
      model: User,
      attributes: ['id', 'nick'],
    },
    // 좋아요 누른 사람 정보 갖고오는것
    {model: User,
      attributes: ['id','nick'],
      as: 'Liker' // through : Like 에서 들고 오기, 이 다대다 model/index.js에도 as Liker로 명시 되어있음, 무조건 as 맞춰야함..
       }
      ],
  //  order: [['createdAt', 'DESC']],
  })
    .then((posts) => {

      // console.log(posts) //이 안에 liker들 post들 정보 다들어있다. 
      res.render('main', { // main.pug 렌더링
        title: 'NodeBird', // main.pug에 있는 변수들
        twits: posts,
        user: req.user,// 즉 done에서 성공시 in localStoragy 세션에 저장이됨 그러고 나서 로그인후 req.user로 접근가능.
        loginError: req.flash('loginError'),  //일회성 메세지들 보여주기위해 에러 넣음 
      });
    })
    .catch((error) => {
      console.error(error);
      next(error);
    });
});




module.exports = router;