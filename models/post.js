module.exports=(sequlize,DataTypes) =>(
    sequlize.define('posts',{
        content: {
            type: DataTypes.STRING(140),
            allowNull:false,
        },
        img:{
            type: DataTypes.STRING(200), // 왜 String 이냐면, 이미지 주소를 저장한다. 이미지를 서버에 저장하고 나면 주소가 생긴다.
            allowNull:true,
        },
    },{
        timestamps:true,
        paranoid:true,
        charset:'utf8',
        collate:'utf8_general_ci',
    })
);