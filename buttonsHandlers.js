//Сохранение даты события
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
    if ($(`#${getKeyByValue(eventsDictionary, eventType)} p`).length > 0) {
        var commentInfo = doesTheCommentExist(eventType);
        showEditingConfirmationButtons(commentInfo, commentText);
    } else {
        if (eventType == eventsDictionary.readyForTestingDate) {
            setButtonsDisabledState(true);
            showComment(getKeyByValue(eventsDictionary, eventType), dateTime.toFullDateString());
            var serviceCardId = await findServiceCard();
            if (!serviceCardId) {
                serviceCardId = await createCardOnServiceBoard();
            }
            await addTrelloCardComment(serviceCardId, commentText);
           await refreshPopup();
        } else {
            var serviceCardIdPromise = findServiceCard();
            if ($('#readyForTestingDate p').length > 0) {
                if (eventType == "Закончили тестирование") {
                    showEndOfTestingConfirmationButtons(serviceCardIdPromise, commentText);
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

//Редактирование комментария
async function commentEditingSaveButtonHandler(commentInfo, newText) {
    setButtonsDisabledState(true);
    var parsedComment = newText.split(': ');
    showComment(getKeyByValue(eventsDictionary, parsedComment[0]), parsedComment[1])
    commentEditingCancelButtonHandler();
    await updateTrelloCardComment(commentInfo.id, newText);
    refreshPopup();
    if (commentInfo.text.includes(eventsDictionary.endOfTestingDate)){
        await updateTrelloCardComment(doesTheCommentExist('Баги').id, 'Баги: ' + await getCardBugAmount());
        await updateTrelloCardComment(doesTheCommentExist('Участники').id, 'Участники: '+ await getCardMembersString())
    }
}

function commentEditingCancelButtonHandler() {
    showBlock('ext-popup-submit');
    hideBlock('edit-comment-confirmation-block');
    showBlock('save-comment-block');
    $('#error-message').text('');
}

//Окончание тестирования
async function endOfTestingConfirmButtonHandler(cardIdPromise, commentText){
    setButtonsDisabledState(true);
    var parsedComment = commentText.split(': ');
    showComment(getKeyByValue(eventsDictionary, parsedComment[0]), parsedComment[1])
    commentEditingCancelButtonHandler();
    await addTrelloCardComment(await cardIdPromise, commentText);
    await refreshPopup();
    await addTrelloCardComment(await cardIdPromise, 'Баги: ' + await getCardBugAmount());
    await addTrelloCardComment(await cardIdPromise, 'Участники: '+ await getCardMembersString());
}

//Добавление ревьюеров
function addReviwersButtonHandler() {
    showFirstAndHideSecondBlock('check-list-review-block', 'testing-dates-input-block');
    $("#reviewers-error-message").text('');
}

async function addReviewerCancelButtonHandler() {
	 await refreshPopup(true);
    showFirstAndHideSecondBlock('testing-dates-input-block', 'check-list-review-block')
}
async function addReviewerSubmitButtonHandler() {
    setButtonsDisabledState(true);
    var reviewer = $('#testing-reviewers-dropdown').val(); 
    $('#current-reviewers-block').find($(`div:contains(${reviewer})`)).show();
    $("#reviewers-error-message").text('');
    cardActions = await getCardsActions();
    var commentInfo = doesTheCommentExist("Ревью:");
    if (commentInfo) {
        if (commentInfo.text.includes(reviewer)) {
            $("#reviewers-error-message").text(reviewer + ' уже значится ревьюером по этой задаче');
            setButtonsDisabledState(false);
            return;
        }
        await updateTrelloCardComment(commentInfo.id, "Ревью:" + getActiveReviewers());
    } else {
        var serviceCardId = await findServiceCard();
        if (!serviceCardId) {
            serviceCardId = await createCardOnServiceBoard();
        }
        await addTrelloCardComment(serviceCardId, "Ревью: " + reviewer + ';');
    }
    refreshReviewersInfo();
}
//Автоматизация
function automationButtonHandler(){
	showFirstAndHideSecondBlock('automation-block', 'testing-dates-input-block');
	showFirstAndHideSecondBlock('automation-info','lack-of-automation-info');
	automationPopupStep = 1;
}

async function automationSubmitButtonHandler(){
	  
	var automationDropdownValue=$('#automation-dropdown').val();
	var lackOfAutomationDropdownValue=$('#lack-of-automation-reasons-dropdown').val();
	if (automationPopupStep == 1){
		if (automationDropdownValue == 'Полностью покрыли функтестами')
		{
		setButtonsDisabledState(true);
		 await addComment("Автоматизация: ", automationDropdownValue);
         await addComment("Причины недостаточной автоматизации: ","");		
		setButtonsDisabledState(false);		 
		  		  refreshPopup(true);
		}
		else
		showFirstAndHideSecondBlock('lack-of-automation-info','automation-info');
		automationPopupStep = 2;
	}
	else {
		setButtonsDisabledState(true);
		await addComment("Автоматизация: ", automationDropdownValue);
         await addComment("Причины недостаточной автоматизации: ", lackOfAutomationDropdownValue);	
		  setButtonsDisabledState(false);
		 await refreshPopup(true);
	}
	}
	
async function addComment(prefix, value){
	   cardActions = await getCardsActions();
			var commentInfo = doesTheCommentExist(prefix);
			if(commentInfo){
			await updateTrelloCardComment(commentInfo.id, prefix + value);
			}
			else {
				var serviceCardId = await findServiceCard();
				if (!serviceCardId) {
					serviceCardId = await createCardOnServiceBoard();
        }
        await addTrelloCardComment(serviceCardId ,prefix + value);
    }
}

function automationCancelButtonHandler(){
	if (automationPopupStep == 1){
		showFirstAndHideSecondBlock('testing-dates-input-block','automation-block');	
	}
	else 
	{
		showFirstAndHideSecondBlock('automation-info','lack-of-automation-info');
		automationPopupStep = 1
		}
}



async function removeReviewerIconHandler(tester) {
    $('#current-reviewers-block').find($(`div:contains(${tester})`)).hide();
    setButtonsDisabledState(true);
    var commentInfo = doesTheCommentExist("Ревью:");
    await updateTrelloCardComment(commentInfo.id, "Ревью:" + getActiveReviewers());
    $("#reviewers-error-message").text('');
    var reviewersBlock = $('#current-reviewers-block').find($('a')).hide();
    refreshReviewersInfo();
}

function getActiveReviewers(){
    var reviewers = $('#current-reviewers-block').find($(`div:visible`));
    var str = '';
        for (var i=0; i< reviewers.length; i++){
            str += ' ' + reviewers[i].firstChild.textContent + ';';
        }
    return str;
}

function setButtonsDisabledState(isDisable){
    var blocks = $('#current-reviewers-block').find($('a'));
    isDisable ? blocks.hide() : blocks.show();
    $('#add-reviewer-submit-button').prop('disabled', isDisable);
    $('#ext-popup-submit').prop('disabled', isDisable);
    $('#comment-editing-save-button').prop('disabled', isDisable);
	$('#comment-editing-save-button').prop('disabled', isDisable);
	$('#automation-submit-button').prop('disabled', isDisable);
}

