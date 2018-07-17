var eventsDictionary = {
    readyForTestingDate: "Готова к тестированию",
    testingStartDate: "Начали тестировать",
    endOfTestingEstimateDate: "Планируем закончить тестирование",
    endOfTestingDate: "Закончили тестирование"
}
var additionalCommentsDictionary = {
	reviewComment: "Ревью",
	members: "Участники",
	automationComment: "Автоматизация",
	lackOfAutomationComment: "Причины недостаточной автоматизации"
}

var automationInfoDictionary = {
	noAutomatization : "Не писали тесты",
	fullAutomatization : "Полностью покрыли функтестами",
	partialAutomatization : "Частично покрыли функтестами"
}

var lackOfAutomationReasonsDictionary = {
	IAmNoob : "Не пишу тесты",
	TestsAlreadyWriten : "Тесты уже написаны",
	dontKnowHowToWriteTestsForThisArea : "Не знаю как писать тесты на эту область",
	difficultScenarios : "Сложные сценарии",
	rareScenarios : "Редкие сценарии. Тесты не нужны",
	enoughAutomation : "Достаточно низкоуровневых тестов"
}

var automationPopupStep;
var testersList;
var cardActions;

async function placePopup() {
    $.get(chrome.runtime.getURL('Popup.htm'),
        function(data) {
            $('#classic').append($('<div>').html(data));
            addDropdownOptions('events-dropdown', eventsDictionary);
            addInfoFromServiveCardBlocks('existingCommentsBlock', eventsDictionary);
			addInfoFromServiveCardBlocks('existingCommentsBlock', additionalCommentsDictionary);
			addInfoFromServiveCardBlocks('existingCommentsBlock', eventsDictionary);
            addInfoFromServiveCardBlocks('current-reviewers-block', testersList);
            addDropdownOptions('testing-reviewers-dropdown', testersList);
			addDropdownOptions('automation-dropdown',automationInfoDictionary);
			addDropdownOptions('lack-of-automation-reasons-dropdown',lackOfAutomationReasonsDictionary);
            for (var tester in testersList) {
                addRemovingButtonsForReviewer(tester);
            }
            $('#ext-popup-close').click(() => hidePopup());
			 $('#add-automation-info').click(() => automationButtonHandler());
			 $('#automation-submit-button').click(() => automationSubmitButtonHandler());
			  $('#automation-cancel-button').click(() => automationCancelButtonHandler());
            $('#ext-popup-submit').click(() => submitPopupHandler());
            $('#add-reviewers').click(() => addReviwersButtonHandler());
            $('#add-reviewer-cancel-button').click(() => addReviewerCancelButtonHandler());
            $('#comment-editing-cancel-button').click(() => commentEditingCancelButtonHandler());
            $('#add-reviewer-submit-button').click(() => addReviewerSubmitButtonHandler());
        }
    );
    $(document).mouseup(function(e) {
        var container = $("#ext-popup");
        if (container.has(e.target).length === 0) {
            container.hide();
        }
    });

    $(document).keydown(function(e) {
        if (e.key == 'Escape'){
            $("#ext-popup").hide();
        }
    });
}

function addDropdownOptions(dropdownId, optionsArray) {
    var dropdown = $(`#${dropdownId}`);
    for (var index in optionsArray) {
        dropdown.append($('<option>').html(optionsArray[index]));
    }
}

function addInfoFromServiveCardBlocks(parentBlockId, blocksInfoArray) {
    block = $(`#${parentBlockId}`);
    for (var key in blocksInfoArray) {
        var commentBlock = $('<div>', {
            id: key,
            css : {
                width: '280px',
                minHeight: '30px',
                display: 'none',
                borderBottom: '1px solid #d6dadc'
            }
        }).html($('<b>').text(blocksInfoArray[key]))
        block.append(commentBlock);
    }
}

async function refreshReviewersInfo() {
    var commentInfo = doesTheCommentExist("Ревью: ");
    $("#reviewers-error-message").text('');
    for (var id in testersList) {
        if (commentInfo && commentInfo.text.includes(testersList[id])) {
            showBlock(id);
        } else {
            hideBlock(id);
        }
    }
    setButtonsDisabledState(false);
}

function addRemovingButtonsForReviewer(id) {
    $(`#${id}`).append($('<a>', {
        id: id + '-close-icon',
        click: () => removeReviewerIconHandler(testersList[id]),
        class: 'icon-sm icon-close'
    }))
}

async function refreshPopup(needFetchActions) {
    if (needFetchActions) {cardActions = await getCardsActions()};
    refreshReviewersInfo();
    showFirstAndHideSecondBlock('testing-dates-input-block', 'check-list-review-block');
    $('#error-message').text('');
    showFirstAndHideSecondBlock('save-comment-block', 'check-list-review-block');
    showBlock('save-comment-block');
    hideBlock('edit-comment-confirmation-block');
	hideBlock('automation-block');
    showBlock('ext-popup-submit');
    for (var comment in eventsDictionary) {
     await refreshComment(eventsDictionary[comment],comment);
    }
	    for (var comment in additionalCommentsDictionary) {
      await refreshComment(additionalCommentsDictionary[comment],comment);
    }

}

async function refreshComment(eventType,blockId){

       await addExistingComment(eventType, blockId);
}
async function showPopup() {
    $("#date-time-input").val(getCurrentDate());
    var el = document.getElementById('testing-popup-button').getBoundingClientRect();
    var child = document.getElementById("ext-popup-container");
    child.style.left = el.x + 'px';
    child.style.top = el.y + el.height + 6 + 'px';
    showBlock("ext-popup");
}

async function addExistingComment(eventType, blockId) {
    var cardInfo = doesTheCommentExist(eventType);
    if (cardInfo) {
        var splitedText = cardInfo["text"].split(': ');
		if(splitedText[1]!=undefined && splitedText[1]!=""){
        $(`#${blockId}`).html('<b>' + splitedText[0] + ':</b><p align="center">' + splitedText[1] + '</p>')
        showBlock(blockId)
		}
		else hideBlock(blockId);
    } else {
        hideBlock(blockId)
    }
}

async function showComment(blockId, dateString){
    var parent = $(`#${blockId}`);
    var el = $(`#${blockId} p`);
    if (el.length > 0) {
        el.text(dateString);
    } else {
        parent.append($('<p>', {
            align: 'center',
            text: dateString
        }));
    }
    parent.show();
}

function hidePopup() {
    $("#ext-popup").hide();
}

async function showEndOfTestingConfirmationButtons(cardIdPromise, commentText) {
    $('#confirm-message').text('Тестирование завершено? Все участники задачи добавлены в карточку? Все ревьюеры отмечены? Указаны данные по автоматизации?');
    $('#comment-editing-save-button').unbind().click(() => endOfTestingConfirmButtonHandler(cardIdPromise, commentText));
    showFirstAndHideSecondBlock('edit-comment-confirmation-block', 'save-comment-block');
}

async function showEditingConfirmationButtons(commentInfo, newText) {
    $('#confirm-message').text('Сохранить новое значение?');
    $('#comment-editing-save-button').unbind().click(() => commentEditingSaveButtonHandler(commentInfo, newText));
    showFirstAndHideSecondBlock('edit-comment-confirmation-block', 'save-comment-block');
}

function showFirstAndHideSecondBlock(blockToShowId, blockToHideId) {
    hideBlock(blockToHideId);
    showBlock(blockToShowId);
}

function showBlock(blockToShowId) {
    $(`#${blockToShowId}`).show();
}

function hideBlock(blockToHideId) {
    $(`#${blockToHideId}`).hide();
}

function getKeyByValue(obj, value) {
    return Object.keys(obj).find(key => obj[key] === value);
}