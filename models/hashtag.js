module.exports=(seqelize,DataTypes)=>(
    seqelize.define('hashtags',{
        title:{
            type: DataTypes.STRING(15),
            allowNull:false,
            unique:true,
        }
    },{
        timestamps:true,
        paranoid:true,
        charset:'utf8',
        collate:'utf8_general_ci',
    })
);