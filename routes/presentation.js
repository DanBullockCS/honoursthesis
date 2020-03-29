// Contains Presentation related routes
const express = require('express');
const router = express.Router();

let Presentation = require('../models/presentation_model.js');

/**************** Whiteboard Page ****************/
router.get('/whiteboard', function (request, response) {
    // User not logged in redirect them
    if (!request.session.username) { response.redirect("/"); }
 
    Presentation.find({ ownerName: username }).then(function (results) {
       if (results.length === 0) {
          response.render('whiteboard', {
             title: 'Whiteboard Slides',
             presentationNames: [],
          });
       } else {
          var presentationNames = [];
          for (i = 0; i < results.length; i++) {
             presentationNames.push(results[i].fileName);
          }
          response.render('whiteboard', {
             title: 'Whiteboard Slides',
             presentationNames: presentationNames,
          });
       }
    });
 
 });
 
 // Uploading a new slideshow
 router.post('/uploadWhiteboard', async function (request, response) {
    var slides = request.body.html;
    var fname = request.body.fileName;
 
    // Saving the uploaded presentation
    newPres = new Presentation({
       ownerName: username,
       fileName: fname,
       fileContent: slides,
    });
    newPres.save(function (error) {
       // Loading all the users presentations
       Presentation.find({ ownerName: username }).then(function (results) {
          var presentationNames = [];
          for (i = 0; i < results.length; i++) {
             presentationNames.push(results[i].fileName);
          }
          if (error) {
             response.json({
                errorMessage: 'Could not create presentation, file name already exists in your presentations',
                presentationNames: presentationNames,
             });
          } else {
             response.json({
                presentationNames: presentationNames,
             });
          }
       });
    });
 });
 
 router.post('/deleteSlides', async function (request, response) {
    let sPresentation = request.body.selectedPresentation;
    try {
       const doc = await Presentation.deleteOne({fileName: sPresentation});
    } catch (err) {
       console.log(err.stack);
    }
 });
 
 /**************** Presentation Page ****************/
 router.get('/presentation', function (request, response) {
    // User not logged in redirect them
    if (!request.session.username) { response.redirect("/"); }
    var fileName = request.query.name;
 
    Presentation.findOne({ ownerName: username, fileName: fileName }).then(function (results) {
       response.render('presentation', {
          title: 'Your Presentation',
          fileContent: results.fileContent,
       });
    });
 
 });
 /************************************************/

 module.exports = router;