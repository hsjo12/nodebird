const express = require('express');

const { isLoggedIn } = require('./middlewares');
const { User } = require('../models');

const router = express.Router();

router.post('/:id/follow', isLoggedIn, async (req, res, next) => {
  try {
 //   console.log(req.user.id) 자기 자신 id
 
   // console.log("____________________________________")
   // console.log(req.params.id) 상대아이디.
    const user = await User.findOne({ where: { id: req.user.id } });//로그인한 자기자신을 찾는다
    await user.addFollowing(parseInt(req.params.id, 10)); //나의 팔로우 대상으로 parseInt(req.params.id, 10)) 이 사람을 추가한다.
         //A.getB : 관계있는 로우 조회
            //A.addB : 관계 생성
            //A.setB : 관계 수정
            //A.removeB: 관계 제거
    res.send('success');
  } catch (error) {
    console.error(error);
    next(error);
  }
});


router.post('/:id/unfollow', isLoggedIn, async (req, res, next) => {
  try {
 //   console.log(req.user.id) 자기 자신 id
 
   // console.log("____________________________________")
   // console.log(req.params.id) 상대아이디.
    const user = await User.findOne({ where: { id: req.user.id } });//로그인한 자기자신을 찾는다
    await user.removeFollowing(parseInt(req.params.id, 10)); //나의 팔로우 대상으로 parseInt(req.params.id, 10)) 이 사람을 추가한다.
         //A.getB : 관계있는 로우 조회
            //A.addB : 관계 생성
            //A.setB : 관계 수정
            //A.removeB: 관계 제거
    res.send('success');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/profile',async(req, res,next)=>{

  try{

    await User.update({nick:req.body.nick},{where: {id: req.user.id}})
    res.redirect('/profile');
  }catch(e){
    console.error(e);
    next(error);
  }

})
module.exports = router;
