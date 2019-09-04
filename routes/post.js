const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { Post, Hashtag, User } = require('../models');
const { isLoggedIn } = require('./middlewares');
// const upload = multer({
//     // storage: 파일경로 
//     // 크게 두가지로 나뉜다 서버 디스크에 저장(diskStorage), 외부 클라우드에 저장 구글, s3등,... 
//     //
//     storage: multer.diskStorage({
//         //cb(에러,결괏값)
//         destination(req,file,cb){ // 파일 저장경로
//             cb(null,'uploads/');// 파일은 uploads라는 폴더(없으면 새로생성하자.)에 저장
//         },
//         filename(req,file,cb){ //파일명
//             //멀터가, 파일이름을 맘대로 바꾸고, 확장자도 안붙여주기에.
//             // 파일명과 확장자를 이런식으로 따로 지정해주자.
//             const ext = path.extname(file.originalname); //확장자. 받아온파일의
//             cb(null,path.basename(file.originalname,ext)+new Date().valueOf+ext)
//             //basename 확장자를 제외한 파일명
//             //파일명+현재시간+확장자. ( 현재시간 넣어준이유: 파일의 중복을 막기위해서)
//             //예를 들어, A라는 사람이 abcjpg를 업로드하고, B라는 사람역시 같은 파일abc.jpg를 입력시 나중파일을 덮어써서 현재시간을 부텨줌.
//         },
//     }),
//     limit: {fileSize: 5 *1024 *1024}, // 파일사이즈
// })
var storage = multer.diskStorage({
    destination(req, file, cb) {
      cb(null, 'uploads/');
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname); //유저가 업로드한 파일의 확장자 부분.
      cb(null,path.basename(file.originalname,ext)+new Date().valueOf+ext)
    },
  })
  
  var fsize = {fileSize: 5 *1024 *1024}
  var upload = multer({ storage: storage , limit : fsize} )

//이미지를 업로드하는 라우터
router.post('/img',isLoggedIn,upload.single('img'),(req,res)=>{ // layout.pug 에    label#img-label(for='img') 사진 업로드 에 아이디가 img여서.
    console.log(req.file);  //**이미지multer로 저장한것은 req.file에 저장, 
                            //**보통은 req.body. 에 저장(아마 이미지는 bodypaser로 읽지 못 해서...) */

    res.json({url:`/img/${req.file.filename}`}); // 제이선으로 서버어디에 이미지가 저장되어있는지 프론트로 응답해준다.

});

//single: 이미지 하나(필드명)
//array: 이미지 여러개(단일 필드)
//fields: 이미지 여러개(여러필드)
//none: 이미지 x


//사진을 안올리시 
//게시글을 업로드 하는 라우터
const upload2=multer();
router.post('/',isLoggedIn,upload2.none(),async(req,res,next)=>{
    
    //게시글을 업로드 
    try {

        const post = await Post.create({
            content:req.body.content,
            img:req.body.url,
            userId: req.user.id, //작성자 사용자 아이디.
        });

        const hashtags = req.body.content.match(/#[^\s#]*/g); //# 을 가져오는 정규 표현식 배열로..
        if(hashtags){
            //안녕하세요 #노드 #익스프레스
            // hashtags = ['#노드','#익스프레스'] ['#노드','#atom']
            //배열.map((요소, 인덱스, 배열) => { return 요소 });
            const result =await Promise.all(hashtags.map(tag=>Hashtag.findOrCreate({ //findOrCreate 있으면 찾고 없으면 만드는 것 DB에
                where:{title:tag.slice(1).toLowerCase()},//#표시지움.대소문자 안할려고 소문자로만.
            })));
            
        const aa = result.map(r=>r[0])
            console.log(aa)
            
            await post.addHashtags(result.map(r=>r[0])); // 게시글안에 있는 해쉬테그를 연결해줌 posthastag db를 보면 서로 db에 연결되어 저장. 이것은 시퀄라이즈로 다대다 관계를 만드것
            //name이 hashtag라서 req.quey.hashtag가 아닙니다. 주소 뒤에 ?hashtag=태그이름 이 붙어서 그렇습니다.
            //A.getB : 관계있는 로우 조회
            //A.addB : 관계 생성
            //A.setB : 관계 수정
            //A.removeB: 관계 제거
         
        }
        res.redirect('/');
    } catch (error) {
        console.error();
        next(error);
        
    }
});

router.get('/hashtag',async(req,res,next) => {
    const query = req.query.hashtag; // 검색 엔지이라 req.query로 들어오고 name 이 hashtag라 req.query.hashtag 들어옴. 주소 창은 http://localhost:8001/post/hashtag?hashtag=hi 이런식으로 나온다.
    if(!query){ // 아무것도 검색안할시..
        return res.redirect('/')
    }
    try {
        const hashtag = await Hashtag.findOne({where:{title:query}}); //쿼리 검색어 입력 받은거 찾기
        let posts = [];
        if(hashtag){ // 검색에 합당한게 있다면
            posts = await hashtag.getPosts({include: [{
                model: User,
                attributes: ['id', 'nick'], // 이름이 user 가된다.
              },
              // 좋아요 누른 사람 정보 갖고오는것
              {model: User,
                attributes: ['id','nick'], // 모델 유저에서 id 와 nick 만 가져와서 쓰겠다
                as: 'Liker'// 이것의 이름을 Liker로 하고, 다대다 관계인 Liker도 이용하겟다.  { id: 2, nick: 'sss', Like: [Like] },
                 }]}); //해쉬태그가 포함된 모든 포스트들을 갖고온다, 갖고 오면서 사용자 정보까지 넣어서 갖고온다.
             //A.getB : 관계있는 로우 조회
            //A.addB : 관계 생성
            //A.setB : 관계 수정
            //A.removeB: 관계 제거
     //       posts1 = await hashtag.getPosts(); //유저값이 안들어있다.


          
            // for (var pt in posts) {
            //     console.log(pt); 
            // }

          //  console.log(posts[0].dataValues.user)
          // console.log(posts[0].user) // datavalues 안써도 작동 잘함.
          // [.. ] 이렇게 되있을경우는 [0]
          // [ ㅇㅇ:{}] 이렇게 되있을 경우는 [0].ㅇㅇ 접근
        }

      

        return  res.render('main',{// main.pug 렌더링
            title: `${query} : NodeBird`,
            user: req.user,
            twits: posts, // 트윗에 검색결과를 넣어주는것, post에 모든게 있어서 이걸로 접근 한다 main.pug 의 twit으로
        });      
    } catch (error) {
        console.log(error);
        next(error);
    }{

    }
})

router.post('/:id/like',async(req,res,next)=>{
    try {
        // 게시글을 찾고, 
        const post = await Post.findOne({where: {id: req.params.id}});
        //게시글에 좋아요 누른 사람을 추가해야함.
        await post.addLiker(req.user.id);
        res.send('OK');
    } catch (error) {
        console.error(error)
        next(error)
        
    }
})

router.delete('/:id/like',async(req,res,next)=>{
    try {
        const post = await Post.findOne({where: {id: req.params.id}});
        await post.removeLiker(req.user.id);
        res.send('OK');
    } catch (error) {
        console.error(error)
        next(error)
        
    }
})

router.delete('/:id',async(req,res,next)=>{
    try {
        // UserID 해 준이유는 내가쓴 게시글만 지우겠다...
        //USerID 는 테이블의 row 이름.
        await Post.destroy({where: {id: req.params.id,  userId: req.user.id }});
        
        res.send('OK');
    } catch (error) {
        console.error(error)
        next(error)
        
    }
})


module.exports = router;