var currentProblems;
var automationPopupStep;
var standProblemsTabStep;
var testersList;
var cardActions;

async function placePopup() {
    $.get(chrome.runtime.getURL('Popup.htm'),
        function(data) {

            $('#classic').append($('<div>').html(data));
            addDropdownOptions('events-dropdown', eventsDictionary);
            addInfoFromServiveCardBlocks('existingCommentsBlock', eventsDictionary);
            addInfoFromServiveCardBlocks('existingCommentsBlock', additionalCommentsDictionary);
            addInfoFromServiveCardBlocks('current-reviewers-block', testersList);
            addDropdownOptions('problems-dropdown', [otherProblemValue]);
            addDropdownOptions('problems-dropdown', testStandProblemsList);
            addDropdownOptions('test-stands-dropdown', testStandsNums);
            addDropdownOptions('testing-reviewers-dropdown', testersList);
            addDropdownOptions('automation-dropdown', automationInfoDictionary);
            addDropdownOptions('lack-of-automation-reasons-dropdown', lackOfAutomationReasonsDictionary);
            for (var tester in testersList) {
                addRemovingButtonsForReviewer(tester);
            }
            $('#add-test-stands-problem-info').click(() => addProblemsInfoButtonHandler());
            $('#ext-popup-close').click(() => hidePopup());
            $('#add-dates-info').click(() => addDatesInfoButtonHandler())
            $('#add-automation-info').click(() => automationButtonHandler());
            $('#problems-block-submit-button').click(() => addProblemsInfoSubmitButtonHandler());
            $('#problems-block-cancel-button').click(() => addProblemsInfoCancelButtonHandler());
            $('#automation-submit-button').click(() => automationSubmitButtonHandler());
            $('#automation-cancel-button').click(() => automationCancelButtonHandler());
            $('#ext-popup-submit').click(() => submitPopupHandler());
            $('#add-reviewers').click(() => addReviwersButtonHandler());
            $('#add-reviewer-cancel-button').click(() => addReviewerCancelButtonHandler());
            $('#comment-editing-cancel-button').click(() => commentEditingCancelButtonHandler());
            $('#add-reviewer-submit-button').click(() => addReviewerSubmitButtonHandler());
            $('#edit-members-info').click(() => editMembersButtonHandler());
            $('#pull-members-from-card').click(() => pullMembersFromCardButtonHandler());
        }
    );
    $(document).mouseup(function(e) {
        var container = $("#ext-popup");
        if (container.has(e.target).length === 0) {
            container.hide();
        }
    });

    $(document).keydown(function(e) {
        if (e.key == 'Escape') {
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
            css: {
                width: '100%',
                minHeight: '30px',
                display: 'none',
                borderTop: '1px solid #d6dadc'
            }
        }).html($('<b>').text(blocksInfoArray[key]))
        block.append(commentBlock);
    }
}

async function refreshPopup(needFetchActions, commentToRefresh) {
    if (needFetchActions) {
        cardActions = await getCardsActions()
    };
    refreshReviewersInfo();
    $('#error-message').text('');
    if (commentToRefresh == undefined) {
        for (var comment in eventsDictionary) {
            await refreshComment(eventsDictionary[comment], comment);
        }
        for (var comment in additionalCommentsDictionary) {
            await refreshComment(additionalCommentsDictionary[comment], comment);
        }
    } else {
        if (eventsDictionary[commentToRefresh] != undefined) {
            await refreshComment(eventsDictionary[commentToRefresh], commentToRefresh);
        } else if (additionalCommentsDictionary[commentToRefresh] != undefined) {
            await refreshComment(additionalCommentsDictionary[commentToRefresh], commentToRefresh);
        }
    }
}

async function refreshComment(eventType, blockId) {
    await addExistingComment(eventType, blockId);
}

async function showPopup() {
    cardActions = await getCardsActions();
    $("#date-time-input").val(getCurrentDate());
    var el = document.getElementById('testing-popup-button').getBoundingClientRect();
    var child = document.getElementById("ext-popup-container");
    child.style.left = el.x + 'px';
    child.style.top = el.y + el.height + 6 + 'px';
    await refreshPopup(false);
    $("#existing-problems-block").empty();
    showProblems();
    showMembers();
    showBlock("ext-popup");
}

async function addExistingComment(eventType, blockId) {
    var cardInfo = doesTheCommentExist(eventType);
    if (cardInfo) {
        var splitedText = cardInfo[0]["text"].split(': ');
        if (splitedText[1] != undefined && splitedText[1] != "") {
            $(`#${blockId}`).html('<b>' + splitedText[0] + ':  </b><p style="display:inline" align="center">' + splitedText[1] + '</p>')
            showBlock(blockId)
        } else hideBlock(blockId);
    } else {
        hideBlock(blockId)
    }
}

async function showComment(blockId, dateString) {
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

function showActiveTab(activeTabId){
	tabsIds.forEach(function(tabId){
		if (tabId==activeTabId){
			 showBlock(tabId);
		}
		else {
			 hideBlock(tabId);
		}
	})
}