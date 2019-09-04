module.exports = (sequelize, DataTypes) => (
    sequelize.define('users', {
        email: {
          type: DataTypes.STRING(40),
          allowNull: true,
          unique: true,
        },
        nick:{
            type: DataTypes.STRING(15),
            allowNull:false,

        },
        password: {       
            type: DataTypes.STRING(100),
            allowNull:true, // 왜냐하면 카카오 로그인시, 그냥 카카오버튼만 누르고 로그인해서

        },
        provider: {
            type: DataTypes.STRING(10),
            allowNull: false,
            defaultValue: 'local', 
          },
          snsId: {
            type: DataTypes.STRING(30),
            allowNull: true,
          },
        }, {
        timestamps: true, //언제 생성이됬는지
        paranoid: true, // 삭제일 기록한다: 실질적으로 로우를 지우지않고, 삭제일을 기록하여, 삭제됬다는걸 표시: 나중에 데이터복구 가능
        charset:'utf8',
        collate:'utf8_general_ci',
    })
);
