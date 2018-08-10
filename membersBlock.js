async function showMembers() {
    cardActions = await getCardsActions();
    $("#current-members-block").empty();
    var members = await doesTheCommentExist("Участники: ");
    if (members) {
        showBlock('current-members-block-header');
        showExistingMembers(members[0]);
    } else hideBlock('current-members-block-header');
}

function showExistingMembers(membersComment) {
    block = $("#current-members-block");
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