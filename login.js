Parse.initialize(
  "tlptR5EO96el5zQ9H9VFNaiv00rm2emcw1iFajjB",
  "Ek6IpmwnApwNtNf73F5VAD5YMv0oSXDgSuCk3J2G"
);
Parse.serverURL = "https://parseapi.back4app.com/";

export let mail = "";

async function logIn(username, password) {
  // Create a new instance of the user class
  var user = Parse.User.logIn(username, password)
    .then(function (user) {
      console.log(
        "User created successful with name: " +
          user.get("username") +
          " and email: " +
          user.get("email")
      );
      mail = user.get("email");
      window.location.href = "/index.html";
    })
    .catch(function (error) {
      alert(error.message);
    });
}



document.getElementById("login").addEventListener("click", function () {
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;
  logIn(username, password);
});

// document.getElementById("show").addEventListener("click", function () {
//   console.log(mail);
// });