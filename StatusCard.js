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
                                }
                                if (allCardsID[j][2] == '5ba1d3ab4e2a3f6912b11e76') {
                                        CardID.style.backgroundColor = '#77dd77';
                                }
                        }
                }
        }
        return true
}

async function CheckCardsStatus() {
        getAllServiceCardName().then((arr) => BackgroundCardChange(arr));
}