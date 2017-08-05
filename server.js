/*jshint esversion: 6*/
const express = require('express');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const db = require('./models');
const Photos = db.photos;
const Users = db.users;
const flash = require('connect-flash');

const RedisStore = require('connect-redis')(session);
const saltRounds = 10;
const bcrypt = require('bcrypt');

const app = express();

const expHbs = require('express-handlebars');

let PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const hbs = expHbs.create({
  defaultLayout: 'main',
  extname: 'hbs'
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

app.use(session({
  store: new RedisStore(),
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

const gal = require('./routes/gallery');
app.use('/gallery', gal);

passport.serializeUser((user, cb)=> {
  cb(null, user.id);
});

passport.deserializeUser((userId, cb) => {
  Users.findById(userId)
  .then( data => cb(null, data));
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    db.users.findOne({ where: { name: username } })
    .then ( user => {
      console.log(user);
      if (user === null) {
        return done(null, false, {message: 'bad username or password'});
      }
      else {
        bcrypt.compare(password, user.password)
        .then(res => {
          if (res) { return done(null, user); }
          else {
            console.log('not working');
            return done(null, false, {message: 'bad username or password'});
          }
        });
      }
    })
    .catch(err => { console.log('error: ', err); });
  }
));

app.get('/', showLoginScreen);

app.post('/login', passport.authenticate('local', {
  successRedirect: '/gallery/',
  failureRedirect: '/',
  failureFlash: 'Invalid username/password combination.'
}));

app.get('/login', (req, res) => {
  res.redirect('/');
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.post('/register', addNewUser);

function addNewUser(req, res){
  bcrypt.genSalt(saltRounds, function(err, salt){
    bcrypt.hash(req.body.password, salt, function(err, hash){
      Users.create({
        name: req.body.username,
        password: hash
      })
      .then( (user) => {
        console.log(user);
        res.redirect('/');
      })
      .catch( err => { return res.send('Stupid username'); });
    });
  });
}

function showLoginScreen(req, res){
  let err = req.flash();
  if ( Object.keys(err).length !== 0 ){
    let errMessage = { errorMessage: err.error[0] };
    res.render('gallery/login', errMessage );
    return;
  }
  res.render('gallery/login');
}

function isAuthenticated(req, res ,next) {
  if(req.isAuthenticated()) {
    return next();
  }
  res.redirect('/index');
}

app.listen(PORT, () => {
  // db.sequelize.drop();
  // db.sequelize.sync({force: true});
  console.log(`server running on ${PORT}`);
});

module.exports = app;