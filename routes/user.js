// Contains Account Management Routes like login/register and account settings
const express = require('express');
const router = express.Router();

let bcrypt = require('bcrypt-nodejs');

let User = require('../models/user_model.js');
let Course = require('../models/course_model.js');

/**************** Home Page and Login/Register ****************/
router.get('/', function (request, response) {
   username = request.session.username;
   if (username) {
      response.render('index', {
         title: 'Home',
         description: 'Welcome to Classroom Companion! Check out your different teacher tools below.',
         username: username
      });
   } else {
      response.render('index', {
         title: 'Home',
         description: 'Welcome to Classroom Companion!',
         username: username
      });
   }

});

router.get('/login', function (request, response) {
   response.render('login', {
      title: 'Login Page',
      errorMessage: ''
   });
});

router.post('/processLogin', function (request, response) {
   username = request.body.username;
   password = request.body.password;

   User.find({ username: username }).then(function (results) {
      if (results.length != 1) {
         // Error logging in - no such user
         response.render('login', {
            username: "", // Make sure the navbar doesn't show logged in features
            errorMessage: 'Login Incorrect'
         });
      } else {
         // User was found, now check the password
         console.log('login password:', results[0].hashedPassword);
         if (bcrypt.compareSync(password, results[0].hashedPassword)) {
            // Password match - successful login
            request.session.username = username;
            response.render('index', {
               title: 'Home',
               description: 'Welcome to Classroom Companion! Check out your different teacher tools below.',
               username: username,
            });
         } else {
            console.log('login: password is not a match');
            // Error logging in - invalid password
            response.render('login', {
               errorMessage: 'Login Incorrect'
            });
         }
      }
   }).catch(function (error) {
      // Error logging in - no such user
      console.log('login: catch');
      response.render('login', {
         errorMessage: 'Login Incorrect'
      });
   });
});

router.get('/register', function (request, response) {
   response.render('register', {
      title: 'Register',
   });
});

router.post('/processRegistration', function (request, response) {
   username = request.body.username;
   email = request.body.email;
   password = request.body.pwd;

   hashedPassword = bcrypt.hashSync(password);
   console.log('register password:', hashedPassword);

   newUser = new User({
      username: username,
      email: email,
      hashedPassword: hashedPassword
   });

   newUser.save(function (error) {
      if (error) {
         response.render('register', {
            errorMessage: 'Username or Email already in use.',
            title: "Register",
         });
      } else {
         request.session.username = username; // Logged in
         response.render('registerConfirm', {
            username: username,
            title: 'Welcome to ClassroomCompanion!'
         });
      }
   });
});

/**************** MyClasses page ****************/
router.get('/myclasses', function (request, response) {
   // User not logged in redirect them
   if (!request.session.username) { response.redirect("/"); }

   Course.find({ ownerName: request.session.username }).then(function (results) {
      var courseNames = [];
      for (i = 0; i < results.length; i++) {
         courseNames.push(results[i].courseName);
      }

      response.render('courses', {
         title: 'My Classes',
         courseName: courseNames,
      });
   }).catch(function (error) {
      // error finding courses or you haven't created any
      console.log('catch: User does not have any courses and is loading course page');
      response.render('courses', {
         errorMessage: 'Error: no courses created! Create a course on the account settings page;'
      });
   });
});

router.post('/reloadStudentList', function (request, response) {
   var cName = request.body.courseName;
   Course.find({ courseName: cName }).then(function (results) {
      var sList = results[0].studentList;
      // Pass studentList back to front end
      response.json({ studentList: sList });
   }).catch(function (error) {
      // Error finding courses or you haven't created any
      console.log('catch: User does not have any courses and is loading course page');
      response.render('courses', {
         errorMessage: 'Error: no courses created! Create a course on the account settings page;'
      });
   });
});

router.post('/deleteClass', function (request, response) {
   var cName = request.body.courseName;
   Course.deleteOne({ courseName: cName }, function (error) {
      if (error) {
         console.log("Error deleting class!");
      } else {
         console.log(cName, " was deleted");
      }
   });
});

router.post('/deleteStudent', async function (request, response) {
   var cName = request.body.courseName;
   var sIndex = request.body.sIndex;

   const doc = await Course.findOne({ courseName: cName });
   doc.studentList.splice(sIndex, 1); // deleting student at index sIndex
   await doc.save();
});

router.post('/addingStudent', async function (request, response) {
   var cName = request.body.courseName;
   var newStudentName = request.body.newStudentName;

   const doc = await Course.findOne({ courseName: cName });
   doc.studentList.push(newStudentName); // adding student
   await doc.save();
});


/**************** Account Page ****************/
router.get('/account', function (request, response) {
   // User not logged in redirect them
   if (!request.session.username) { response.redirect("/"); }

   User.find({ username: username }).then(function (results) {
      username = results[0].username;
      email = results[0].email;

      response.render('account', {
         title: 'Account Settings',
         username: username,
         email: email,
      });
   });
});

router.post('/createClass', function (request, response) {
   ownername = request.session.username;
   course_name = request.body.enter_class_name;
   student_list = request.body.enter_student_names.split("\n");

   newCourse = new Course({
      ownerName: ownername,
      courseName: course_name,
      studentList: student_list,
   });

   newCourse.save(function (error) {
      if (error) {
         response.render('account', {
            errorMessage: "That Class already exists!",
            title: 'Account Settings',
            username: username,
            email: email,
         });
      } else {
         response.render('account', {
            errorMessage: "Class Created!",
            title: 'Account Settings',
            username: username,
            email: email,
         });
      }
   });
});

module.exports = router;