Parse.initialize(
  "tlptR5EO96el5zQ9H9VFNaiv00rm2emcw1iFajjB",
  "Ek6IpmwnApwNtNf73F5VAD5YMv0oSXDgSuCk3J2G"
);
Parse.serverURL = "https://parseapi.back4app.com/";

$(document).ready(function () {
  const currentUser = Parse.User.current();

  let mail = "";
  if (currentUser) {
    mail = currentUser.get("email");
    $(".mail").html(`${mail}`);
    getData();
  }

  function getData() {
    //Giriş yapıldıktan sonra kullanıcıya dair tablo ve kartlar gelir.
    const query = new Parse.Query("Board");
    if (currentUser) {
      const mail = currentUser.get("email");
      query.equalTo("mail", mail);
      query
        .find()
        .then((results) => {
          for (const result of results) {
            const title = result.get("listName");
            const objId = result.id;
            if (title !== "") {
              //title getiren kısım
              var addedDiv =
                '<div class="addedDiv sortable"><h2 class="listTitle" id="' +
                objId +
                '">' +
                title +
                '</h2><div class="removeList"><img src="close-img.png" alt=""></div>' +
                '<div class="rowDiv"><div class="row"><button class="newCard">Add New Card</button>' +
                '<input type="text" class="cardInfoInput" style="display: none;"' +
                ' placeholder="Enter card info"></div></div></div>';
              $(".content").prepend(addedDiv);
              $(".content").sortable();
              $(".content").disableSelection();
            }
            var cards = [];
            cards = result.get("cards");
            if (cards !== undefined) {
              for (let i = 0; i < cards.length; i++) {
                //kart getiren kısım
                var card =
                  '<div class="addedCard draggable" style="position: relative;">' +
                  cards[i] +
                  '<div class="removeCard"><img src="close-img.png" alt=""></div></div>';
                $("#" + objId)
                  .siblings()
                  .closest(".rowDiv")
                  .append(card);
              }
            }
          }
          $(".rowDiv").sortable();
          $(".rowDiv").disableSelection();
          $(".draggable").draggable({
            cursor: "grabbing",
            opacity: "0.5",
            revert: true,
          });
          $(".rowDiv").droppable({
            accept: ".draggable",
            drop: function (event, ui) {
              ui.helper.appendTo(this);
            },
          });
        })
        .catch((error) => {
          console.error("Error: " + error.message);
        });
    }
  }

  //drag drop yapılırken liste içeriği güncelleme
  $(".content").on("dragstart", ".draggable", function () {
    var oldList = $(this).closest(".addedDiv").find(".listTitle").attr("id");
    console.log("Old List: " + oldList);
    var card = $(this).text();
    var isDrag = true;
    deleteCard(card, oldList, isDrag);
  });
  $(".content").on("dragstop", ".draggable", function () {
    var newList = $(this).closest(".addedDiv").find(".listTitle").attr("id");
    console.log("New List: " + newList);
    var card = $(this).text();
    console.log(card);
    saveCard(card, newList);
  });

  //Add New List butonu
  $("#newList").click(function (e) {
    $("#listTitleInput").css("display", "inline-block").focus();
  });

  $("#listTitleInput").keypress(async function (e) {
    if (e.which === 13) {
      var title = $(this).val().trim();
      if (title !== "") {
        var objId = await saveList(title);
        var addedDiv =
          '<div class="addedDiv sortable"><h2 class="listTitle" id="' +
          objId +
          '">' +
          title +
          '</h2><div class="removeList"><img src="close-img.png" alt=""></div>' +
          '<div class="rowDiv"><div class="row"><button class="newCard">Add New Card</button>' +
          '<input type="text" class="cardInfoInput" style="display: none;" placeholder="Enter card info"></div></div></div>';
        $(".content").prepend(addedDiv);
        $(".content").sortable();
        $(".content").disableSelection();
        $(this).val("").css("display", "none");
      }
    }
  });

  async function saveList(title) {
    $("#cover-spin").show(0);
    const board = new Parse.Object("Board");
    board.set("listName", title);
    board.set("mail", mail);

    try {
      const savedBoard = await board.save();
      const objId = savedBoard.id;
      console.log("New Board objectId: " + objId);
      console.log("List saved successfully!");
      $("#cover-spin").hide(0);
      return objId;
    } catch (error) {
      console.error("Error saving list:", error);
      $("#cover-spin").hide(0);
    }
  }

  //Add New Card butonu
  $(".content").on("click", ".newCard", function (e) {
    $(this).siblings(".cardInfoInput").css("display", "inline-block").focus();

    var cardInfoInput = $(this).siblings(".cardInfoInput");

    cardInfoInput.keypress(async function (e) {
      if (e.which === 13) {
        var cardInfo = cardInfoInput.val().trim();

        if (cardInfo !== "") {
          var card =
            '<div class="addedCard draggable" style="position: relative;">' +
            cardInfo +
            '<div class="removeCard"><img src="close-img.png" alt=""></div></div>';
          $(this).closest(".rowDiv").append(card);
          $(".rowDiv").sortable();
          $(".rowDiv").disableSelection();
          $(".draggable").draggable({
            cursor: "grabbing",
            opacity: "0.5",
            revert: true,
          });
          $(".rowDiv").droppable({
            accept: ".draggable",
            drop: function (event, ui) {
              ui.helper.appendTo(this);
            },
          });

          cardInfoInput.val("").css("display", "none");

          var parentList = $(this).closest(".addedDiv");
          var parentListId = parentList.find(".listTitle").attr("id");
          saveCard(cardInfo, parentListId);
        }
      }
    });
  });
  function saveCard(cardInfo, parentListId) {
    $("#cover-spin").show(0);
    const board = Parse.Object.extend("Board");
    const query = new Parse.Query(board);
    query.equalTo("objectId", parentListId);
    query.first().then(function (object) {
      try {
        object.add("cards", cardInfo);
        object.save();
        console.log("saved");
        $("#cover-spin").hide(0);
      } catch (error) {
        console.log("Error code: " + error);
        $("#cover-spin").hide(0);
      }
    });
  }

  //Silme işlemleri için
  $(".content").on("click", ".removeList", function () {
    var parentList = $(this).closest(".addedDiv");
    var parentListId = parentList.find(".listTitle").attr("id");
    $(this).closest(".addedDiv").remove();
    deleteList(parentList, parentListId);
  });
  $(".content").on("click", ".removeCard", function () {
    var removingCard = $(this).closest(".addedCard").text();
    var parentList = $(this).closest(".addedDiv");
    var parentListId = parentList.find(".listTitle").attr("id");
    $(this).closest(".addedCard").remove();
    deleteCard(removingCard, parentListId);
  });

  $(".content").on("click", ".listTitle", function () {
    $(this).css("display", "inline-block").focus();
  });

  function deleteList(parentList, parentListId) {
    $("#cover-spin").show(0);
    const board = Parse.Object.extend("Board");
    const query = new Parse.Query(board);
    query.equalTo("objectId", parentListId);
    query.first().then(function (object) {
      try {
        object.destroy();
        console.log("deleted");
        $("#cover-spin").hide(0);
      } catch (error) {
        console.log("Error code: " + error);
        $("#cover-spin").hide(0);
      }
    });
  }

  function deleteCard(removingCard, parentListId, isDrag) {
    if (!isDrag) {
      $("#cover-spin").show(0);
    }
    const board = Parse.Object.extend("Board");
    const query = new Parse.Query(board);
    query.equalTo("objectId", parentListId);
    query.first().then(function (object) {
      try {
        let cards = object.get("cards");
        const updatedCards = cards.filter((card) => card !== removingCard);
        object.set("cards", updatedCards);
        object
          .save()
          .then(function () {
            console.log("Card removed successfully");
            $("#cover-spin").hide(0);
          })
          .catch(function (error) {
            console.log("Error saving object:", error);
            $("#cover-spin").hide(0);
          });
      } catch (error) {
        console.log("Error code: " + error);
      }
    });
  }

  $(".logout").click(function (e) {
    Parse.User.logOut().then(
      function () {
        window.location.href = "login.html";
      },
      function (error) {
        console.error("Error: " + error.message);
      }
    );
  });
});
