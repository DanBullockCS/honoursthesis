// Note: classes are called "courses" on the backend

// JS libraries
let express = require('express');
let app = express();
let session = require('express-session');
let bodyParser = require('body-parser');
let uuid = require('uuid/v1');
let mongoose = require('mongoose');

// Set the root directory to client folder to find images etc
app.use(express.static(__dirname + '/client'));

// Database config
mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost:27017/classroomcompanion', {
   useUnifiedTopology: true,
   useNewUrlParser: true
},
   function (error) {
      if (error) {
         return console.error('Unable to connect:', error);
      }
   });
mongoose.set('useCreateIndex', true);

// Middleware
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
   limit: '100mb', // Limiting for uploading pptx slides
   extended: true,
}));

// Configure Pug templating
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

// Configure sessions
app.use(session({
   genid: function (request) {
      return uuid();
   },
   resave: false,
   saveUninitialized: false,
   secret: 'ssbu discord equator amdradeonr9'
}));


/**************** Routes ****************/
const userRouter = require('./routes/user.js');
const courseRouter = require('./routes/course.js');
const presentationRouter = require('./routes/presentation.js');

app.use(userRouter);
app.use(courseRouter);
app.use(presentationRouter);

/**************** GroupMaker Page ****************/
app.get('/groupMaker', function (request, response) {
   // User not logged in redirect them
   if (!request.session.username) { response.redirect("/"); }

   response.render('groupMaker', {
      title: 'Group Maker'
   });
});

/**************** Logout Page ****************/
app.get('/logout', function (request, response) {
   request.session.username = '';
   response.redirect('/');
});

// Web listener
app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'), function () {
   console.log('ClassroomCompanion Server listening on port ' + app.get('port'));
});
