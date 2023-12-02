Parse.initialize(
  "tlptR5EO96el5zQ9H9VFNaiv00rm2emcw1iFajjB",
  "Ek6IpmwnApwNtNf73F5VAD5YMv0oSXDgSuCk3J2G"
);
Parse.serverURL = "https://parseapi.back4app.com/";

$(document).ready(function () {
  const currentUser = Parse.User.current();

  let mail = "";
  var titles = [];
  if (currentUser) {
    mail = currentUser.get("email");
    $(".mail").html(`${mail}`);
    getData();
    console.log(titles);
  }

  function getData() {
    //After logging in, tables and cards related to the user are shown.
    const query = new Parse.Query("Board");
    if (currentUser) {
      const mail = currentUser.get("email");
      query.equalTo("mail", mail);
      query
        .find()
        .then((results) => {
          results.sort((a, b) => a.get("Order") - b.get("Order"));
          for (const result of results) {
            const title = result.get("listName");
            const order = result.get("Order");
            const objId = result.id;
            if (title !== "") {
              const addedDiv = `<div class="addedDiv sortable" id="${order}"><div class="listTitleWrapper" id="${objId}">
                <h2 class="listTitle" >${title}</h2>
                <div class="removeList"><img src="close-img.png" alt=""></div></div>
                <div class="rowDiv">
                  <div class="row">
                    <button class="newCard"><i class="fa-solid fa-pencil fa-lg"></i>  Add New Card</button>
                    <input type="text" class="cardInfoInput" style="display: none;" placeholder="Enter card info">
                  </div>
                </div>
              </div>`;
              titles.push(order);
              $(".content").append(addedDiv);
              $(".content").sortable();
              $(".content").disableSelection();
            }
            var cards = [];
            cards = result.get("cards");
            if (cards !== undefined) {
              for (let i = 0; i < cards.length; i++) {
                const card = `<div class="addedCard draggable" style="position: relative;">
                  ${cards[i]}
                  <div class="removeCard"><img src="close-img.png" alt=""></div>
                </div>`;
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

  //updating list content while drag dropping
  $(".content").on("dragstart", ".draggable", function () {
    var oldList = $(this)
      .closest(".addedDiv")
      .find(".listTitleWrapper")
      .attr("id");
    console.log("Old List: " + oldList);
    var card = $(this).text();
    var isDrag = true;
    deleteCard(card, oldList, isDrag);
  });
  $(".content").on("dragstop", ".draggable", function () {
    var newList = $(this)
      .closest(".addedDiv")
      .find(".listTitleWrapper")
      .attr("id");
    console.log("New List: " + newList);
    var card = $(this).text();
    console.log(card);
    saveCard(card, newList);
  });

  $(".content").sortable({
    start: function (event, ui) {
      // Code to run when the sorting process starts
      console.log("Sıralama işlemi başladı");
    },
    stop: function (event, ui) {
      updateAddedDivOrder();
      console.log("Sıralama işlemi bitti");
    },
  });

  function updateAddedDivOrder() {
    $(".addedDiv").each(function (index) {
      const order = index + 1;
      const objectId = $(this).find(".listTitleWrapper").attr("id");
      $(this).attr("id", order);
      updateObjectOrder(order, objectId);
    });
  }

  function updateObjectOrder(order, objectId) {
    const board = Parse.Object.extend("Board");
    const query = new Parse.Query(board);
    query.equalTo("objectId", objectId);
    query.first().then(function (object) {
      try {
        object.set("Order", order);
        object.save();
        console.log("saved");
        $("#cover-spin").hide(0);
      } catch (error) {
        console.log("Error code: " + error);
        $("#cover-spin").hide(0);
      }
    });
  }

  //Add New List button
  $("#newList").click(function (e) {
    $("#listTitleInput").css("display", "inline-block").focus();
  });

  $("#listTitleInput").keypress(async function (e) {
    if (e.which === 13) {
      var title = $(this).val().trim();
      var order = 1;

      if (title !== "") {
        var objId = await saveList(title, order);
        var addedDiv = `<div class="addedDiv sortable" id="${order}"><div class="listTitleWrapper" id="${objId}">
        <h2 class="listTitle" >${title}</h2>
        <div class="removeList"><img src="close-img.png" alt=""></div></div>
        <div class="rowDiv">
          <div class="row">
            <button class="newCard"><i class="fa-solid fa-pencil fa-lg"></i>  Add New Card</button>
            <input type="text" class="cardInfoInput" style="display: none;" placeholder="Enter card info">
          </div>
        </div>
      </div>`;
        $(".content").prepend(addedDiv);
        $(".content").sortable();
        $(".content").disableSelection();
        $(this).val("").css("display", "none");
        titles.unshift(order);
        updateAddedDivOrder();
        console.log(titles);
      }
    }
  });

  async function saveList(title, order) {
    $("#cover-spin").show(0);
    const board = new Parse.Object("Board");
    board.set("listName", title);
    board.set("mail", mail);
    board.set("Order", order);
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

  //Add New Card button
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
          var parentListId = parentList.find(".listTitleWrapper").attr("id");
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

  //For delete list and card
  $(".content").on("click", ".removeList", function () {
    var order = $(this).closest(".addedDiv").attr("id");
    var parentList = $(this).closest(".addedDiv");
    var parentListId = parentList.find(".listTitleWrapper").attr("id");

    parentList.fadeOut("slow", function () {
      $(this).remove();
      deleteList(parentList, parentListId, order);
    });
  });
  $(".content").on("click", ".removeCard", function () {
    var removingCard = $(this).closest(".addedCard").text();
    var parentList = $(this).closest(".addedDiv");
    var parentListId = parentList.find(".listTitleWrapper").attr("id");
    $(this).closest(".addedCard").remove();
    deleteCard(removingCard, parentListId);
  });

  function deleteList(parentList, parentListId, order) {
    //$("#cover-spin").show(0);
    const board = Parse.Object.extend("Board");
    const query = new Parse.Query(board);
    const deletedTitle = titles.findIndex((item) => item == order);
    console.log(deletedTitle);
    query.equalTo("objectId", parentListId);
    query.first().then(function (object) {
      try {
        object.destroy();
        titles.splice(deletedTitle, 1);
        console.log("deleted");
        updateAddedDivOrder();
        console.log(titles);
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

  //for logout
  $(".logout").click(function (e) {
    Parse.User.logOut().then(
      function () {
        window.location.href = "/loginPage/login.html";
      },
      function (error) {
        console.error("Error: " + error.message);
      }
    );
  });
});
