module.exports = function(sequelize, DataTypes) {
  var Photo = sequelize.define("photos", {
    link: {type: DataTypes.STRING,
      validate: {
        isUrl: true
      }
    },
    description: DataTypes.TEXT,
    owner: DataTypes.INTEGER
  });
  Photo.associate = function(models){
    Photo.belongsTo(models.authors);
  };
  return Photo;
};