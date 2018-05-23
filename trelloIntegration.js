  async function addTrelloCardComment(cardId, commentText) {
      var options = {
          method: "POST"
      };
      var addCommentUrl = 'https://api.trello.com/1/cards/' + cardId +
          '/actions/comments?text=' + commentText +
          '&key=' + apiKey +
          '&token=' + apiToken;
      await fetch(addCommentUrl, options);
      cardActions = await getCardsActions();
  }

  function doesTheCommentExist(eventType) {

      var result = {}
      if (cardActions != undefined) {
          for (var i = 0; i < cardActions.length; i++) {
              if (cardActions[i].data.text != undefined && cardActions[i].data.text.includes(eventType)) {
                  result["text"] = cardActions[i].data.text;
                  result["id"] = cardActions[i].id;
                  return result;
              }
          }
      }
      return null
  }

  async function getTestersList() {
      var options = {
          method: "GET"
      };
      var testers = await fetch(readTestersListUrl, options).then((resp) => resp.json())
          .then(function(data) {
              var result = {}
              for (var i in data) {
                  result[data[i].id] = data[i].fullName;
              }
              return result;
          })
      return testers;
  }

  async function createCardOnServiceBoard() {
      var cardId = document.URL.split("/")[4];
      var options = {
          method: "POST"
      };
      var createCardOnServiceBoardUrl = 'https://api.trello.com/1/cards' +
          '?name=' + cardId +
          '&idList=' + inProgressListId +
          '&key=' + apiKey +
          '&token=' + apiToken;
      var newCardId = await fetch(createCardOnServiceBoardUrl, options).then((resp) => resp.json())
          .then(function(data) {
              return data.shortLink;
          })
      return newCardId;
  }

  async function findServiceCard() {
      var cardId = document.URL.split("/")[4];
      var options = {
          method: "GET"
      };
      var getCardsFromInProgressListUrl = 'https://api.trello.com/1/lists/' + inProgressListId + '/cards?fields=id,name,shortLink' +
          '&key=' + apiKey +
          '&token=' + apiToken;
      cards = await fetch(getCardsFromInProgressListUrl, options).then((resp) => resp.json())
          .then(function(data) {
              return data;
          })
      for (var i in cards) {
          if (cards[i].name == cardId) {
              return cards[i].shortLink;
          }
      }
  }

  async function getCardsActions() {
      var serviceCardId = await findServiceCard();
      if (serviceCardId != null) {
          var options = {
              method: "GET"
          };
          var readAllCommentsUrl = 'https://api.trello.com/1/cards/' + serviceCardId + '/actions' +
              '?type=commentCard' +
              '&filter=commentCard' +
              '&fields=id,data' +
              '&key=' + apiKey +
              '&token=' + apiToken;
          var cardActions = await fetch(readAllCommentsUrl, options).then((resp) => resp.json())
              .then(function(data) {
                  return data;
              })
          return cardActions
      } else return [];
  }

  async function updateTrelloCardComment(actionId, newText) {
      var options = {
          method: "PUT"
      };
      var updateCommentUrl = 'https://api.trello.com/1/actions/' + actionId + '/text?value=' + newText +
          '&key=' + apiKey +
          '&token=' + apiToken;
      await fetch(updateCommentUrl, options);
      cardActions = await getCardsActions();
  }