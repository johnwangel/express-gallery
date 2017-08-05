module.exports = function(sequelize, DataTypes) {
  var Author = sequelize.define("authors", {
    name: DataTypes.STRING
  });
  Author.associate = function(models){
    Author.hasMany(models.photos);
  };

  return Author;
};