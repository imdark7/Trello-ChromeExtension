//Сохранение даты события
function addDatesInfoButtonHandler() {
    setTabButtonActiveColor("add-dates-info-button");
    showActiveTab('testing-dates-input-block');
    showBlock('save-comment-block');
    hideBlock('edit-comment-confirmation-block');
    $("#error-message").text('');
}

async function submitPopupHandler() {
    var dateString = $('#date-time-input').val();
    if (dateString == "") {
        $('#error-message').text('Необходимо заполнить дату');
        showBlock('ext-popup-submit');
        return;
    }
    var dateTime = new Date(dateString);
    var eventType = $('#events-dropdown').val();
    if (!isValidDate(eventType, dateTime)) {
        showBlock('save-comment-block');
        return;
    }

    var commentText = eventType + ": " + dateTime.toFullDateString();
    if ($(`#${getKeyByValue(eventsDictionary, eventType)}`).length > 0) {
        var commentInfo = doesTheCommentExist(eventType)
        if (commentInfo) {
            showEditingConfirmationButtons(commentInfo[0], commentText);
        } else {
            if (eventType == eventsDictionary.readyForTestingDate) {
                setButtonsDisabledState(true);
                showComment(getKeyByValue(eventsDictionary, eventType), dateTime.toFullDateString());
                var serviceCardId = await findServiceCard();
                if (!serviceCardId) {
                    serviceCardId = await createCardOnServiceBoard();
                }
                await addTrelloCardComment(serviceCardId, commentText);
                await refreshPopup(true);
            } else {
                var serviceCardIdPromise = findServiceCard();
                if ($('#readyForTestingDate').length > 0) {
                    if (eventType == "Закончили тестирование") {
                        showEndOfTestingConfirmationButtons(serviceCardIdPromise, commentText);
                        addCardLabelsTestingEnd();
                    } else {
                        setButtonsDisabledState(true);
                        showComment(getKeyByValue(eventsDictionary, eventType), dateTime.toFullDateString());
                        await addTrelloCardComment(await serviceCardIdPromise, commentText);
                        await refreshPopup(true);
                    }
                } else {
                    $('#error-message').text('Карточка недоступна для редактирования');
                }
            }
        }
    }
}

async function commentEditingSaveButtonHandler(commentInfo, newText) {
    setButtonsDisabledState(true);
    var parsedComment = newText.split(': ');
    showComment(getKeyByValue(eventsDictionary, parsedComment[0]), parsedComment[1])
    commentEditingCancelButtonHandler();
    await updateTrelloCardComment(commentInfo.id, newText);
    if (commentInfo.text.includes(eventsDictionary.endOfTestingDate)) {
        await updateTrelloCardComment(doesTheCommentExist('Баги')[0].id, 'Баги: ' + await getCardBugAmount());
        await updateTrelloCardComment(doesTheCommentExist('Участники')[0].id, 'Участники: ' + await getCardMembersString())
    }
    await refreshPopup(true);
}

function commentEditingCancelButtonHandler() {
    showBlock('ext-popup-submit');
    hideBlock('edit-comment-confirmation-block');
    showBlock('save-comment-block');
    $('#error-message').text('');
}

async function endOfTestingConfirmButtonHandler(cardIdPromise, commentText) {
    setButtonsDisabledState(true);
    var parsedComment = commentText.split(': ');
    showComment(getKeyByValue(eventsDictionary, parsedComment[0]), parsedComment[1])
    commentEditingCancelButtonHandler();
    await addTrelloCardComment(await cardIdPromise, commentText);
    await refreshPopup();
    await addTrelloCardComment(await cardIdPromise, 'Баги: ' + await getCardBugAmount());
    await addTrelloCardComment(await cardIdPromise, 'Участники: ' + await getCardMembersString());
}
////////////////////////

//Добавление проблем с тачками
function addProblemsInfoButtonHandler() {
    setTabButtonActiveColor("add-test-stands-problem-button");
    showActiveTab('problems-block');
    $("#problem-comment-input").val('')
    showBlock('fill-problems-info-block');
    hideBlock("add-new-problem-block");
    hideBlock('problems-block-cancel-button');
    $("#new-problem-error-message").text('');
    standProblemsTabStep = 1;
}

async function addProblemsInfoSubmitButtonHandler() {
    var problemsDropdownValue = $('#problems-dropdown').val();
    var problemsCommentValue = $('#problem-comment-input').val();
    var testStandNumber = $('#test-stands-dropdown').val();

    if (standProblemsTabStep == 1) {
        if (problemsDropdownValue == otherProblemValue) {
            showFirstAndHideSecondBlock("add-new-problem-block", "fill-problems-info-block");
            showBlock('problems-block-cancel-button');
            standProblemsTabStep = 2;
        }
        else {
            $("#new-problem-error-message").text('');
            setButtonsDisabledState(true);
            var serviceCardId = await findServiceCard();
            if (!serviceCardId) {
                serviceCardId = await createCardOnServiceBoard();
            }
            await addTrelloCardComment(serviceCardId, "Проблема: Тестовый стенд: " + testStandNumber + '; Тип проблемы: ' + problemsDropdownValue + '; Комментарий: ' + problemsCommentValue);
            showProblems();
            setButtonsDisabledState(false);
        }
    }
    else {
        var newProblemDescription = $('#new-problem-input').val();
        if (newProblemDescription == "") {
            $("#new-problem-error-message").text('Введите описание проблемы или вернитесь назад и выберите значение из дропдауна');
            return;
        }
        setButtonsDisabledState(true);
        var serviceCardId = await findServiceCard();
        if (!serviceCardId) {
            serviceCardId = await createCardOnServiceBoard();
        }
        var trelloProblemDescriptionText = "Проблема: Тестовый стенд: " + testStandNumber + '; Проблема: ' + newProblemDescription;
        if (problemsCommentValue != "")
            trelloProblemDescriptionText += '; Комментарий: ' + problemsCommentValue;
        await addTrelloCardComment(serviceCardId, trelloProblemDescriptionText)
        showProblems();
        if (Object.values(testStandProblemsList).indexOf(newProblemDescription) == -1 || newProblemDescription == otherProblemValue) {
            await addNewItemToChecklist(newProblemDescription, testStandProblemsListId);
            $("#problems-dropdown").append($('<option>').html(newProblemDescription));
        }
        $("#problem-comment-input").val('')
        setButtonsDisabledState(false);
        addProblemsInfoCancelButtonHandler();
    }
}

function addProblemsInfoCancelButtonHandler() {
    hideBlock('problems-block-cancel-button');
    $("#new-problem-error-message").text('');
    showFirstAndHideSecondBlock("fill-problems-info-block", "add-new-problem-block");
    standProblemsTabStep = 1;
}

async function removeProblemIconHandler(id) {
    setButtonsDisabledState;
    await deleteTrelloCardComment(id);
    $(`#${id}`).remove();
}
///////////////////////////

//Добавление ревьюеров
function addReviwersButtonHandler() {
    setTabButtonActiveColor("add-reviewers-button");
    showActiveTab('check-list-review-block');
    $("#reviewers-error-message").text('');
}

async function addReviewerSubmitButtonHandler() {
    setButtonsDisabledState(true);
    var reviewer = $('#testing-reviewers-dropdown').val();
    $('#current-reviewers-block').find($(`div:contains(${reviewer})`)).show();
    $("#reviewers-error-message").text('');
    cardActions = await getCardsActions();
    var commentInfo = doesTheCommentExist("Ревью:");
    if (commentInfo) {
        if (commentInfo[0].text.includes(reviewer)) {
            $("#reviewers-error-message").text(reviewer + ' уже значится ревьюером по этой задаче');
            setButtonsDisabledState(false);
            return;
        }
        await updateTrelloCardComment(commentInfo[0].id, "Ревью:" + getActiveReviewers());
    } else {
        var serviceCardId = await findServiceCard();
        if (!serviceCardId) {
            serviceCardId = await createCardOnServiceBoard();
        }
        await addTrelloCardComment(serviceCardId, "Ревью: " + reviewer + ';');
    }
    await refreshPopup(true, 'reviewComment');
}

async function removeReviewerIconHandler(tester) {
    $('#current-reviewers-block').find($(`div:contains(${tester})`)).hide();
    setButtonsDisabledState(true);
    var commentInfo = doesTheCommentExist("Ревью:");
    await updateTrelloCardComment(commentInfo[0].id, "Ревью:" + getActiveReviewers());
    $("#reviewers-error-message").text('');
    var reviewersBlock = $('#current-reviewers-block').find($('a')).hide();
    refreshPopup(true, 'reviewComment');
}

function getActiveReviewers() {
    var reviewers = $('#current-reviewers-block').find($(`div:visible`));
    var str = '';
    for (var i = 0; i < reviewers.length; i++) {
        str += ' ' + reviewers[i].firstChild.textContent + ';';
    }
    return str;
}
///////////////

//Автоматизация
function automationButtonHandler() {
    setTabButtonActiveColor("add-automation-info-button");
    showActiveTab('automation-block');
    hideBlock('automation-cancel-button');
    showBlock('automation-info');
    hideBlock('not-automated-info');
    hideBlock('partially-automated-info');
    automationPopupStep = 1;
}

async function automationSubmitButtonHandler() {
    var automationDropdownValue = $('#automation-dropdown').val();
    if (automationPopupStep == 1) {
        if (automationDropdownValue == "Покрыта полностью функциональность") {
            await addAutomationComments(automationDropdownValue, "");
        }
        else if (automationDropdownValue == "Не покрыта функциональность") {
            showBlock('automation-cancel-button');
            showFirstAndHideSecondBlock('not-automated-info', 'automation-info');
            automationPopupStep = 2;
        }
        else {
            showBlock('automation-cancel-button');
            showFirstAndHideSecondBlock('partially-automated-info', 'automation-info');
            automationPopupStep = 2;
        }
    }
    else if (automationPopupStep == 2) {
        if (automationDropdownValue == "Не покрыта функциональность") {
            var notAutomatedDropdownValue = $('#not-automated-reasons-dropdown').val();
            if (notAutomatedDropdownValue != "Указать другую причину") {
                await addAutomationComments(automationDropdownValue, notAutomatedDropdownValue);
            }
            else {
                automationPopupStep = 3;
                showFirstAndHideSecondBlock('add-new-reason-block', 'not-automated-info');
            }
        } else {
            var partiallyAutomatedDropdownValue = $('#partially-automated-reasons-dropdown').val();
            if (partiallyAutomatedDropdownValue != "Указать другую причину") {
                await addAutomationComments(automationDropdownValue, partiallyAutomatedDropdownValue);
            }
            else {
                automationPopupStep = 3;
                showFirstAndHideSecondBlock('add-new-reason-block', 'partially-automated-info');
            }
        }
    }
    else {
        if (automationDropdownValue == "Не покрыта функциональность") {
            var notAutomatedInputValue = $('#new-reason-input').val();
            if (notAutomatedInputValue == "") {
                $("#new-lack-of-automation-reason-error-message").text('Введите причину или вернитесь назад и выберите значение из дропдауна');
                return;
            }
            else {
                await addAutomationComments(automationDropdownValue, notAutomatedInputValue);
                await addNewItemToChecklist(notAutomatedInputValue, notAutomatedReasonsListId);
                $("#not-automated-reasons-dropdown").append($('<option>').html(notAutomatedInputValue));
                ///Тут добавить добавление коммента, добавление новой причины в дропдаун, добавление новой причины в общий дропдаун
            }
        } else {
            var partiallyAutomatedInputValue = $('#new-reason-input').val();
            if (partiallyAutomatedInputValue == "") {
                $("#new-lack-of-automation-reason-error-message").text('Введите причину или вернитесь назад и выберите значение из дропдауна');
                return;
            }
            else {
                await addAutomationComments(automationDropdownValue, partiallyAutomatedInputValue);
                await addNewItemToChecklist(partiallyAutomatedInputValue, partiallyAutomatedReasonsListId);
                $("#partially-automated-reasons-dropdown").append($('<option>').html(partiallyAutomatedInputValue));
                ///Тут добавить добавление коммента, добавление новой причины в дропдаун, добавление новой причины в общий дропдаун
            }
        }
    }
}

async function addAutomationComments(automationInfo, lackOfAutomationInfo) {
    setButtonsDisabledState(true);
    $("#new-lack-of-automation-reason-error-message").text('');
    await addComment("Автоматизация: ", automationInfo);
    await addComment("Причины недостаточной автоматизации: ", lackOfAutomationInfo);
    hideBlock('automation-cancel-button');
    showBlock('automation-info');
    hideBlock('not-automated-info');
    hideBlock('partially-automated-info');
    hideBlock('add-new-reason-block');
    automationPopupStep = 1;
    await refreshPopup(true, 'automationComment');
    await refreshPopup(true, 'lackOfAutomationComment');
    setButtonsDisabledState(false);
}

async function addComment(prefix, value) {
    cardActions = await getCardsActions();
    var commentInfo = doesTheCommentExist(prefix);
    if (commentInfo) {
        await updateTrelloCardComment(commentInfo[0].id, prefix + value);
    } else {
        var serviceCardId = await findServiceCard();
        if (!serviceCardId) {
            serviceCardId = await createCardOnServiceBoard();
        }
        await addTrelloCardComment(serviceCardId, prefix + value);
    }
}

function automationCancelButtonHandler() {
    if (automationPopupStep == 2) {
        showFirstAndHideSecondBlock('automation-info', 'not-automated-info');
        hideBlock('automation-cancel-button');
        hideBlock('partially-automated-info');
        automationPopupStep = 1;
    }
    else {
        $("#new-lack-of-automation-reason-error-message").text('');
        automationPopupStep = 2;
        showFirstAndHideSecondBlock('not-automated-info', 'add-new-reason-block')
        $('#new-reason-input').val("");
    }
}
/////////////////

function setButtonsDisabledState(isDisable) {

    tabsIds.forEach(function (id) {
        var buttons = $('#' + id).find($('a'));
        isDisable ? buttons.hide() : buttons.show();
    });
    buttonsIds.forEach(function (id) {
        $('#' + id).prop('disabled', isDisable);
    });
}

//Редактирование участников

function editMembersButtonHandler() {
    setTabButtonActiveColor("edit-members-info-button");
    showActiveTab('card-members-edit-block');
}

async function pullMembersFromCardButtonHandler() {
    setButtonsDisabledState(true);
    var serviceCardId = await findServiceCard();
    if (!serviceCardId) {
        serviceCardId = await createCardOnServiceBoard();
    }
    var membersComment = doesTheCommentExist('Участники');
    if (membersComment) {
        await updateTrelloCardComment(membersComment[0].id, 'Участники: ' + await getCardMembersString())
    } else {
        await addTrelloCardComment(serviceCardId, 'Участники: ' + await getCardMembersString());
    }
    refreshPopup(true, 'members');
    await showMembers();
    setButtonsDisabledState(false);
}

async function removeMember(blockNum, nameToRemove, commentId) {
    setButtonsDisabledState(true);
    var commentCurrentText = await readCommentText(commentId)
    await updateTrelloCardComment(commentId, commentCurrentText.replace(nameToRemove + ";", "").trim());
    $("#member-" + blockNum).remove();
    refreshPopup(true, 'members');
    setButtonsDisabledState(false);
}