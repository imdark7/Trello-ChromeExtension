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
                                CardID.style.backgroundColor = '#99d2ff';
                                if (allCardsID[j][2] == '5ba1d3ab4e2a3f6912b11e76') {
                                        CardID.style.backgroundColor = '#7cd55b';
                                }
                        }
                }
        }
        return true
}

async function CheckCardsStatus() {
        getAllServiceCardName().then((arr) => BackgroundCardChange(arr));
}