
/*jshint esversion: 6 */
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const router = express.Router();
let db = require('../models');
let Authors = db.authors;
let Photos = db.photos;

router.get('/', getAllGalleries);

//done
router.get('/new', newGalleryForm);

router.get('/:id', displayGalleryPhoto);
router.get('/:id/edit', editPhoto);

//done
router.post('/', loadNewPhoto);

router.put('/:id', updatePhoto);

router.delete('/:id', deletePhoto);

let errorMessages = [
{
  key: 'permission_denied',
  value: "You do not have permission to edit this file."
}];

function getAllGalleries(req, res) {
  let currUser = getSessionPassportId(req.session);

  Photos.findAll({
    include: [{model: Authors}]
  })
  .then( function (fotos) {
    let photosArray = [];
    fotos.forEach( (item, index) => {
      let hero = false;
      if (index === 0){ hero = true; }
      let newObject = { id: item.id, link: item.link, description: item.description, owner: item.author.name, hero: hero };

      if (currUser && currUser === item.owner) {
        newObject.showEditButton = true;
      } else {
        newObject.showEditButton = false;
      }
      photosArray.push(newObject);
    });
    let locals = { locals: photosArray };
    res.render('gallery/index', locals);
  })
  .catch((err) => {
    console.log(err);
  });
}

//Display Gallery Form
function newGalleryForm(req, res) {
  let currUser = getSessionPassportId(req.session);
  if (currUser === false ) {
    res.render('gallery/login', { errorMessage : "You must log in to perform that operation." });
    return;
  }
  res.render('gallery/new');
}

//Displays a gallery photo based on request ID
function displayGalleryPhoto(req, res) {
  Photos.findById(req.params.id,
    {include: [{model: Authors}]})
  .then((photoById) => {
    let locals = {link: photoById.link, description: photoById.description, name: photoById.author.name };
    res.render('gallery/photo', locals);
  })
  .catch((err) => {
    console.log(err);
  });
}

function editPhoto(req, res){
 let currUser = getSessionPassportId(req.session);

 Photos.findById(req.params.id,
  {include: [{model: Authors}]})
 .then((photoById) => {
  if (currUser !== photoById.owner){
    res.render('gallery/login', { errorMessage: "You must log in to perform that operation." });
    return;
  }
  let locals = {id : photoById.id, link: photoById.link, description: photoById.description, name: photoById.author.name };
  res.render('gallery/edit', locals);
});
}

function loadNewPhoto(req, res) {
  let name = req.body.author;
  let url = req.body.link;
  let description = req.body.description;
  req.flash(errorMessages);
  let currUser = getSessionPassportId(req.session);
  if (currUser === false || currUser === undefined ) {
    res.render('gallery/login', { errorMessage : "You must log in to perform that operation." });
    return;
  }

  let auId;

  Authors.findAll( { where: {name: name} } )
  .then( result => {
    if (result[0] === undefined) {
      Authors.create( {name: name} )
      .then( ret => {
        auId = ret.dataValues.id;
        Photos.create( {link: url, description: description, authorId: auId, owner: currUser} );
        let locals = {link: url, description: description, name: name };
        res.render('gallery/photo', locals);
      });
    } else {
      auId = result[0].dataValues.id;
      Photos.create({link: url, description: description, authorId: auId, owner: currUser });
      let locals = {link: url, description: description, name: name };
      res.render('gallery/photo', locals);
    }
  });
}

function updatePhoto(req, res){

  let sessionId = getSessionPassportId(req.session);
  if (!sessionId) {
    res.render('gallery/login', { errorMessage : "You must log in to perform that operation." });
    return;
  }
  Photos.findById(req.params.id)
  .then( photoById => {
    Photos.update( { description : req.body.description }, { where: { id: req.params.id } } )
    .then( photoById => res.redirect('/gallery/') );
  });
}

function deletePhoto(req, res){
  Photos.destroy( { where: { id:req.params.id } } );
  res.redirect('/gallery/');
}

function getSessionPassportId(sess){
  if (!sess.passport && !sess.passport.user){
    return false;
  }
  return sess.passport.user;
}

module.exports = router;

