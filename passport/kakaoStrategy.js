const KakaoStoragy = require('passport-kakao').Strategy;
const {User} = require('../models');

//2 , 4
module.exports = (passport) =>{
    passport.use(new KakaoStoragy({
        clientID:process.env.KAKAO_ID,//카카오 앱 아이디
        callbackURL:'/auth/kakao/callback' // 카카오 리다이렉트 주소 (카카오 콜백받을 주소 or 라우터( 즉 여기로 프로필 반환) )
        //callbackURL:'/auth/kakao/callback'  는 카카오에서 정보를 인증받고 인자들을 콜백(accessToken, refreshToken, profile, done)한다 
    },async(accessToken, refreshToken, profile, done)=>{

        // 로그인은 카카오가 대신 해주지만, 저희 디비에도 사용자를 저장합니다.
        //snsID ,provider 사용
        try{ //async 문이니까..
            console.log(profile)//궁금하면,이거 뜩어서 보기
        const exUser = await User.findOne({// 지금 내 DB에 이전에 회원이 와서 가입해서 내 DB에 저장되어있는지 확인
            snsID: profile.id, //카카오가 로그인되서 반환 받은 profile.id 값에 snsID 저장되어있다.
            provider: 'kakao',
        });
        if(exUser){ // 기존에 내 사이트에, 카카오아이디로 로그인 한 유저가 있을시.
            done(null,exUser);
        }
        //내 DB에 저장
        else{ // 만약에 없다면 만약에 처음내 사이트와서 카카오톡으로 가입할때, 내 DB에저장시켜야함.
          
            const newUser=await User.create({
                email:profile._json.kaccount_email,
                nick:profile.displayName,
                snsId:profile.id,
                provider: 'kakao', // sns회사가 어떤거냐 할 때 구분하기위해, navver facebook, google....
            });
        // 저장후 성공시키기    
            done(null, newUser);
        }
    }
    catch(err){
        console.log(err);
        done(err);
    }
    }))
}


//전략의 껍데기.
// module.exports = (passport) =>{
    
// }