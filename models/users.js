/*jshint esversion: 6*/
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("users", {
    name: {
      type: DataTypes.STRING,
      unique: true
    },
    password: DataTypes.STRING
  });

  return User;
};

