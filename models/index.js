const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.js')[env];
const db = {};

const sequelize = new Sequelize(
  config.database,config.username,config.password,config,
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

//db 각테이블에서 끌어오기
db.User = require('./user')(sequelize, Sequelize);
db.Post = require('./post')(sequelize, Sequelize);
db.Hashtag = require('./hashtag')(sequelize, Sequelize);

//1 대 다 관계
// 유저가 여러개의 포스트를 갖고, 많은 포스트는 한개의 유저에 속함.
db.User.hasMany(db.Post);
db.Post.belongsTo(db.User);

//다대다 관계
//하나의 포스트에는 여러개의 해쉬태그가 존재 할 수 있다.
// 한개의 해쉬태그에는 여러개의 포스트가 존재할수있다.
//그래서 다대다 관계.

//다대다 관계는 belongsToMany()
//through에는 새로 생기는 모델이름을 넣어줍니다 ( 매칭 테이블 )

db.Post.belongsToMany(db.Hashtag, {through: 'PostHashtag'});
db.Hashtag.belongsToMany(db.Post,{through: 'PostHashtag'});

//다대다 관계시 새 테이블 (매칭테이블)이 필요하다. 

//1 안녕하세요 #노드 #익스프레스
//2 안녕하세요 #노드 #제이슨
//3 안녕하세요 #제이드 #퍼그

//매칭 테이블.. 새 태이블
// 1-1
// 1-2
// 2-1
// 2-3
// 3-3
// 3-4


//1 노드
//2 익스프레스
//3 제이드
//4 퍼그

//다대다 관계
//한 유저가 여러명의 유저를 팔로잉 할 수 있다.
//한 유저의 팔로워가  여러명일 수 있다
//그래서 다대다 관계.

// as : 매칭 모델 이름 
// foreignKey : 상대 테이블 아이디
//A.belongsToMany(B,{as: 'Bname',foreignKey:'A_id'})
db.User.belongsToMany(db.User,{through:'Follow',as:'Followers',foreignKey:'followingId'});
db.User.belongsToMany(db.User,{through:'Follow',as:'Followings',foreignKey:'followerId'});

// 1 제로
// 2 네로
// 3 히어로
// 4 바보

// 일반인 - 유명인
// 1-2
// 1-3
// 2-3
// 3-1
// 1-4

// 1 제로
// 2 네로
// 3 히어로
// 4 바보

// 한 유저가 많은 좋아요를 할 수 있따.
// 한 포스트에 여러개의 좋아요를 받을수 있다.
// 다대다 관계성립.
db.User.belongsToMany(db.Post,{through:'Like', as : 'Liker'});
db.Post.belongsToMany(db.User,{through:'Like' , as : 'Liker'});
module.exports = db;
