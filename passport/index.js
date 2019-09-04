const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const { User } = require('../models');

const user = {};
module.exports = (passport) => {
 
  passport.serializeUser((user, done) => {
    // {id:1, name:zero, age:25} -> 1
    done(null, user.id); // 사용자 정보를 모두 세션에 저장하기 무거워서 아이디만 저장.

  });

  //메모리에 1번만 저장
  passport.deserializeUser((id, done) => {
    //console.log("안녕 나 실행.")
    //  1 로 찾고-> {id:1, name:zero, age:25} 찾은후 -> req.user 저장
    if(user[id]){
      done(user[id]);
    }else{
      User.findOne({ 
        where: { id },
        // 이 부분에서 팔로워 팔로잉을 req.url 에 넣어준다./
        include:[{ 
          model : User,
          atribute:['id','nick'],
          as: 'Followers' // db 인덱스 부분에 있음..
        
        },{
          model:User,
          atribute:['id','nick'],
          as: 'Followings'// db 인덱스 부분에 있음..
        }],
      })
      .then(user => done(null, user)) //done(null, user) 여기서 req.user를 저장된다....
      .catch(err => done(err));
    }
 
  });
  local(passport);
  kakao(passport);
};
