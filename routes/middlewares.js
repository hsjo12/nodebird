exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) { // 로그인 여부를 알려준다.
      next(); // 로그인 됫으면 다음으로 넘어간다.
    } else {
      res.status(403).send('로그인 필요');
    }
  };
  
exports.isNotLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) { // 로그인을 안했으면
      next();  //다음으로 넘어가고
    } else { // 했으면
      res.redirect('/'); // 메인페이지로.
    }
  };