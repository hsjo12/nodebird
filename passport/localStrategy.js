const LocalStrategy = require('passport-local').Strategy;
const {User} = require('../models');
const bcrypt = require('bcrypt');


// 사용자가 폼에다가, 가입할 아이디, 패스워드를 넣고 회원가입 버튼을 누르면.
// app.js 에서 urlencoded 미들웨어가 해석한 req.body의 값들을 
// usernameField, passwordField에 연결합니다.
module.exports = (passport) =>{

    passport.use(new LocalStrategy({  
        usernameField: 'email', // req.body.email join.pug 에서 넘어옴.
        passwordField: 'password', //req.body.password
    }, async(email, password, done) =>{ // done (에러, 성공, 실패) 이런 포맷이있음.
        try{

            const exUser = await User.findOne({where:{email}}); // 시퀄라이즈 쿼리를 해서, where:{email}로 email을 가진사람이 있는지 체크를한다.
            if(exUser){
                //비밀 번호 검사
                const result = await bcrypt.compare(password, exUser.password); //bcrypt.compare로 입력된 비밀번호와 기존에 저장된 번호를 비교
                //bcrypt 비밀번호를 암호화하고, 비밀번호를 비교하는데 쓰인다. 보통 많이 쓰인다 sha 보다. 간단하면서 파워풀.
                if(result){// result가 트루면..
                    done(null, exUser); // 성공시 성공자리 인자에 사용자 정보에 넣는거
                }else{
                    done(null,false,{message: '비밀번호가 일치하지 않습니다..'}) 
                }
            }else{ // 이메일 없으면.
                done(null,false,{message:'가입되지 않은 회원입니다.'}) // 실패에 넣어줌.
            }
                // 가입되지 않은 회원입니다 와 비밀번호가 일치하지 않습니다 이런식으로 분기 처리시 해커들에게 취약해서 하나로만 만든다. 예를들어 이메일 또는 비밀번호가 맞지안ㅅ습니다.
        }catch(e){
            console.error(e);
            done(e);
        }
    }))
}

//done(서버에러)
//done(null, 사용자 정보)
// done (null, false, 실패 정보)
