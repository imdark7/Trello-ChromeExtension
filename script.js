var target = document.getElementById('board');
var card = document.getElementsByClassName('card-detail-window')[0];
var flag = true
var timeCounterСheckCardsStatus = 0;
var statusCards =  getAllServiceCardName();

setInterval(async function () {
    if (flag && document.querySelector(".window-sidebar") && !document.getElementById('testing-popup-button')) {
        flag = false;
        var windowSidebar = $('.window-sidebar').first();

        if (!document.getElementById('ext-popup-container')) {
            testersList = await getTestersList();
            testStandProblemsList = await getChecklistItems(testStandProblemsListId);
            automationTypesList = await getChecklistItems(automationInfoListId);
            notAutomatedReasonsList = await getChecklistItems(notAutomatedReasonsListId);
            partiallyAutomatedReasonsList = await getChecklistItems(partiallyAutomatedReasonsListId);
            reasonsOfDelayList = await getChecklistItems(reasonsOfDelayListId);
            await placePopup();
        };
        placeLinks(windowSidebar);
        refreshPopup(true);
        flag = true;
    }
}, 850); //todo переписать на отлов событий

setInterval(async function () {
    statusCards.then((arr) => BackgroundCardChange(arr));
    (timeCounterСheckCardsStatus == 1) ? statusCards = getAllServiceCardName() : timeCounterСheckCardsStatus;
    (timeCounterСheckCardsStatus == 600) ? timeCounterСheckCardsStatus = 0 : timeCounterСheckCardsStatus++;
}, 1000);

function placeLinks(block) {
    var testingBlock = $('<div>', {
        class: 'window-module u-clearfix'
    })
        .append($('<h3>', {
            text: 'Тестирование'
        }))
        .append(getActionButton("Сроки тестирования", "testing-popup-button", "start"));
    block.prepend(testingBlock);
}

function getActionButton(name, id, iconSource) {
    return $('<a>', {
        class: 'button-link',
        text: name,
        id: id,
        click: () => showPopup()
    }).prepend($('<span>', {
        class: 'icon-sm plugin-icon',
        css: {
            backgroundImage: `url(${chrome.runtime.getURL(`icons/${iconSource}.png`)})`
        }
    }));
}