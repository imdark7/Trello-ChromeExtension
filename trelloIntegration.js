  async function addTrelloCardComment(cardId, commentText) {
      var options = {
          method: "POST"
      };
      var addCommentUrl = 'https://api.trello.com/1/cards/' + cardId +
          '/actions/comments?text=' + commentText +
          '&key=' + apiKey +
          '&token=' + apiToken;
      var response = await fetch(addCommentUrl, options).then((resp) => resp.json());
      cardActions = await getCardsActions();
      return response.id;
  }
  
async function readCommentText(commentId){
	   var options = {
          method: "GET"
      };	  
	 var readCommentUrl="https://api.trello.com/1/actions/" + commentId + "/data" +
	 '?key=' +apiKey +
     '&token=' + apiToken;
	var response= await fetch(readCommentUrl, options).then((resp) => resp.json());
	return response.text.trim();
  }

  function doesTheCommentExist(eventType) {
      var result = [];
      if (cardActions != undefined) {
          for (var i = 0; i < cardActions.length; i++) {
              if (cardActions[i].data.text != undefined && cardActions[i].data.text.includes(eventType)) {
                  result.push({
                      "text": cardActions[i].data.text,
                      "id": cardActions[i].id
                  });
              }
          }
      }
      if (result.length > 0)
          return result;
      else return null
  }

  async function getChecklistItems(checklistId) {
      var options = {method: "GET"};
      var getChecklistItemsUrl = 'https://api.trello.com/1/checklists/' + checklistId + '?fields=name&cards=all&card_fields=name' +
          '&key=' + apiKey +
          '&token=' + apiToken;
      var problems = await fetch(getChecklistItemsUrl, options).then((resp) => resp.json())
          .then(function(data) {
              var result = {}
              for (var i = 0; i < data.checkItems.length; i++) {
                  result[i] = data.checkItems[i].name;
              }
              return result;
          })
      return problems;
  }

  async function addNewItemToChecklist(itemName, listId) {
      var options = {
          method: "POST"
      };
      var addNewProblemsTypeUrl = 'https://api.trello.com/1/checklists/' + listId + '/checkItems' +
          '?name=' + itemName +
          '&pos=top' +
          '&key=' + apiKey +
          '&token=' + apiToken;
      await fetch(addNewProblemsTypeUrl, options)
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

  async function getCardAndBoardNames(cardId) {
      var options = {
          method: "GET"
      };
      var getCardAndBoardNamesUrl = 'https://api.trello.com/1/cards/' + cardId +
          '?fields=name&board=true&board_fields=name' +
          '&key=' + apiKey +
          '&token=' + apiToken;
      var names = await fetch(getCardAndBoardNamesUrl, options).then((resp) => resp.json())
          .then(function(data) {
              return "Карточка: " + data.name + "; Доска: " + data.board.name;
          })
      return names;
  }
  async function createCardOnServiceBoard() {
      var cardId = document.URL.split("/")[4];
      var cardDesc = await getCardAndBoardNames(cardId);
      var options = {
          method: "POST"
      };
      var createCardOnServiceBoardUrl = 'https://api.trello.com/1/cards' +
          '?name=' + cardId +
          '&idList=' + inProgressListId +
          '&desc=' + cardDesc +
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

  async function getCardBugAmount() {
      var cardId = document.URL.split("/")[4];
      var options = {
          method: "GET"
      }
      var getCardChecklist = 'https://api.trello.com/1/cards/' + cardId + '/checklists' +
          '?key=' + apiKey +
          '&token=' + apiToken;
      var checklists = await fetch(getCardChecklist, options).then((resp) => resp.json())
          .then(function(data) {
              return data;
          });
      var list = checklists.find((l) => (l.name.toLowerCase() == 'bugs' || l.name.toLowerCase() == 'баги'));
      return Object.is(list, undefined) ? 0 : list.checkItems.length;
  }

  async function getCardMembersString() {
      var cardId = document.URL.split("/")[4];
      var options = {
          method: "GET"
      }
      var getMembers = 'https://api.trello.com/1/cards/' + cardId + '?fields=none' +
          '&actions=addMemberToCard,removeMemberFromCard' +
          '&action_fields=member' +
          '&action_member_fields=fullName' +
          '&action_memberCreator=false' +
          '&members=true' +
          '&member_fields=fullName' +
          '&key=' + apiKey +
          '&token=' + apiToken;
      var str = '';
      var response = await fetch(getMembers, options).then((resp) => resp.json())
          .then(function(data) {
              return data;
          });
      response.members.forEach(element => {
          str += element.fullName + ';';
      });
      response.actions.forEach(element => {
          if (str.indexOf(element.member.fullName) < 0) {
              str += element.member.fullName + '; ';
          }
      });

      return str;
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

  async function deleteTrelloCardComment(actionId) {
      var options = {
          method: "DELETE"
      };
      var deleteCommentUrl = 'https://api.trello.com/1/actions/' + actionId +
          '?key=' + apiKey +
          '&token=' + apiToken;
      await fetch(deleteCommentUrl, options);
  };


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