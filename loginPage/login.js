Parse.initialize(
  "tlptR5EO96el5zQ9H9VFNaiv00rm2emcw1iFajjB",
  "Ek6IpmwnApwNtNf73F5VAD5YMv0oSXDgSuCk3J2G"
);
Parse.serverURL = "https://parseapi.back4app.com/";

async function logIn(username, password) {
  // Create a new instance of the user class
  var user = Parse.User.logIn(username, password)
    .then(function (user) {

      window.location.href = "/App/index.html";
    })
    .catch(function (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.message
    });
  });
}

document.getElementById("login").addEventListener("click", function () {
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;
  if (username.length >= 3 && password.length >= 3) {
    logIn(username, password);
  } else {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Something went wrong!",
    });
  }
});
