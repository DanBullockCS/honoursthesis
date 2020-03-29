// Check if password matches confirm password in register
var check = function() {
  if(document.getElementById('pwd').value == document.getElementById('confirm_pwd').value) {
    document.getElementById('confirm_pwd').classList.remove("is-invalid");
    document.getElementById('pwd_match').innerText = "";
  } else {
    document.getElementById('confirm_pwd').classList.add("is-invalid");
    document.getElementById('pwd_match').innerText = "Passwords do not match";
  }
}

// Check that the email inputted is valid
function validateEmail(input) {
  var mail_regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if(input.value.match(mail_regex)) {
    document.register_form.email.classList.remove("is-invalid");
    document.getElementById('email_format').innerText = "";
  } else {
    document.register_form.email.classList.add("is-invalid");
    document.getElementById('email_format').innerText = "Improper email format, please double check your email";
  }
}

// Do this in the backend, rather than passing a list of all the usernames in the database to the frontend.
// Check that the username doesn't exist in the Database
// function validateUsername(input) {
//   let usernames = [];
//   // This does not actually check the db
//   for (let i = 0; i < usernames.length; i++) {
//      if (usernames[i] === input.value) {
//         document.register_form.username.classList.add("is-invalid");
//         document.getElementById('username_valid').innerText = "Username already exists";
//      }
//   }
//   document.register_form.username.classList.remove("is-invalid");
//   document.getElementById('username_valid').innerText = "";
// }

// Making sure something was entered for each field
document.addEventListener("keyup", function() {
  if (document.getElementById('pwd').value != "" &&
      document.getElementById('confirm_pwd').value != "" &&
      document.getElementById('email').value != "" &&
      document.getElementById('username').value != "") {
    document.getElementById('register_btn').disabled = false;
  } else {
    document.getElementById('register_btn').disabled = true;
  }
});
