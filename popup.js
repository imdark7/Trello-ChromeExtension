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
            addDropdownOptions('test-stands-dropdown', testStandsDictionary);
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

async function refreshReviewersInfo() {
    var commentInfo = doesTheCommentExist("Ревью: ");
    $("#reviewers-error-message").text('');
    for (var id in testersList) {
        if (commentInfo && commentInfo[0].text.includes(testersList[id])) {
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

function showExistingProblem(problems) {
    block = $("#existing-problems-block");
    for (var i = 0; i < problems.length; i++) {
        var s = "dasda";
        var q = $(`#${s}`)
        if ($(`#${problems[i].id}`).length) continue;
        var problemMessageHtml = parseProblemComment(problems[i].text)
        var commentBlock = $('<div>', {
            id: problems[i].id,
            css: {
                width: '100%',
                minHeight: '30px',
                display: 'inline-block',
                borderTop: '1px solid #d6dadc'
            }
        }).html(problemMessageHtml);
        block.append(commentBlock);
        addRemovingButtonForProblem(problems[i].id);
    }
}

function addRemovingButtonForProblem(id) {
    $(`#${id}`).append($('<a>', {
        id: id + '-close-icon',
        click: () => removeProblemIconHandler(id),
        class: 'icon-sm icon-close',
        css: {
            verticalAlign: '80%',
            Align: 'right'
        }
    }))
}


async function showProblems() {
    cardActions = await getCardsActions();
    var problems = await doesTheCommentExist("Проблема: ");
    if (problems) {
        showBlock('current-problems-header');
        showExistingProblem(problems);
    } else hideBlock('current-problems-header');
}

async function showMembers() {
    cardActions = await getCardsActions();
    var members = await doesTheCommentExist("Участники: ");
    if (members) {
        showBlock('current-members-block-header');
        showExistingMembers(members[0]);
    } else hideBlock('current-members-block-header');
}

function showExistingMembers(membersComment) {
    block = $("#current-members-block");
    $("#current-members-block").empty();
    var membersArray = membersComment.text.replace("Участники: ", "").split("; ");
    for (var i = 0; i < membersArray.length; i++) {
        if (membersArray[i] == "") continue;
        var memberBlock = $('<div>', {
            id: 'member-' + i,
            css: {
                width: '100%',
                minHeight: '30px',
                display: 'inline-block',
                borderTop: '1px solid #d6dadc'
            }
        }).html($('<div>', {
            css: {
                display: 'inline-block',
                width: '90%',
                verticalAlign: 'middle'
            }
        }).html($('<b>').text(membersArray[i].trim())));
        block.append(memberBlock);
        addRemovingButtonForMember(i, membersArray[i], membersComment);
    }
}

function addRemovingButtonForMember(blockNum, nameToRemove, comment) {
    {
        $("#member-" + blockNum).append($('<a>', {
            id: 'member-' + blockNum + '-close-icon',
            click: () => removeMember(blockNum, nameToRemove, comment),
            class: 'icon-sm icon-close',
            css: {
                display: 'inline-block',
                marginTop: '15px'
            }
        }))
    }
}


function parseProblemComment(text) {
    var parsed = text.replace("Проблема:", "").trim().split(';');
    var result = "";
    result += "<div style=\"width:90%;display:inline-block\"><b>Стенд: </b>" + parsed[0].split(":")[1].trim() +
        "</br><b>Проблема: </b>" + parsed[1].split(":")[1].trim();
    var comment = parsed[2].split(":")[1].trim();
    if (comment != "")
        result += "</br><b>Комментарий: </b>" + comment;
    return result + "</div>";
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