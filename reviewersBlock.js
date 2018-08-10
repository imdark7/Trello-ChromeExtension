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
