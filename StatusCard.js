function BackgroundCardChange(allCardsID) {
        var $divs = $('div');
        var links = $divs.find("a.list-card"), i = 0, cnt = 0;
        for (i; i < links.length; i++) {
                var id = links[i].href.split("/")[4];
                for (var j = 0; j < allCardsID.length; j++) {
                        if (id == allCardsID[j][1]) {
                                result = 1;
                                cnt++;
                                var CardID = links[i];
                                if (allCardsID[j][2] == '5ba1d40bf933f814156d7f79') {
                                        CardID.style.backgroundColor = '#7fc7ff';
                                        //IdCards.style.border = "1px solid black";
                                }
                                if (allCardsID[j][2] == '5ba1d3ab4e2a3f6912b11e76') {
                                        CardID.style.backgroundColor = '#77dd77';
                                        //IdCards.style.border = "1px solid black";
                                }
                        }
                }
        }
        return true
}

async function getAllServiceCardName() { // получить список всех сервисных карт
        var options = {
                method: "GET"
        };
        var getCardsFromInProgressListUrl = 'https://api.trello.com/1/lists/' + inProgressListId + '/cards?fields=id,name,labels,shortLink' +
                '&key=' + apiKey +
                '&token=' + apiToken;
        cards = await fetch(getCardsFromInProgressListUrl, options).then((resp) => resp.json())
                .then(function (data) {
                        return data;
                })
        var AllCards = new Array();
        for (var i in cards) {
                var propirtyCards = new Array();
                propirtyCards[0] = cards[i].shortLink;
                propirtyCards[1] = cards[i].name;
                propirtyCards[2] = (cards[i].labels.length > 0) ? cards[i].labels[0].id : 0;
                AllCards[i] = propirtyCards;
        }
        return AllCards
}

async function CheckCardsStatus() {
        var promise = getAllServiceCardName();
        promise.then((arr) => BackgroundCardChange(arr));
        return
}

async function addCardLabelsTestingProcess(serviseCardId) {
        var options = {
                method: "PUT"
        };
        var setLabelsFromInProgressListUrl = 'https://api.trello.com/1/cards/' + serviseCardId + '?idLabels=5ba1d40bf933f814156d7f79' +
                '&key=' + apiKey +
                '&token=' + apiToken;
        set = await fetch(setLabelsFromInProgressListUrl, options).then((resp) => resp.json())
                .then(function (data) {
                        return data;
                })
        return
}

async function addCardLabelsTestingEnd() {
        var promise = findServiceCard();
        promise.then((id) => addCardLabelsTestingProcessEnd(id));
        return
}

async function addCardLabelsTestingProcessEnd(serviseCardId) {
        deleteLabels(serviseCardId);
        var options = {
                method: "PUT"
        };
        var setLabelsFromInProgressListUrl = 'https://api.trello.com/1/cards/' + serviseCardId + '?idLabels=5ba1d3ab4e2a3f6912b11e76' +
                '&key=' + apiKey +
                '&token=' + apiToken;
        set = await fetch(setLabelsFromInProgressListUrl, options).then((resp) => resp.json())
                .then(function (data) {
                        return data;
                })
        return
}

async function deleteLabels(serviseCardId) {
        var options = {
                method: "DELETE"
        };
        var setLabelsFromInProgressListUrl = 'https://api.trello.com/1/cards/' + serviseCardId + '/idLabels/5ba1d40bf933f814156d7f79' +
                '&key=' + apiKey +
                '&token=' + apiToken;
        set = await fetch(setLabelsFromInProgressListUrl, options).then((resp) => resp.json())
                .then(function (data) {
                        return data;
                })
        return
}