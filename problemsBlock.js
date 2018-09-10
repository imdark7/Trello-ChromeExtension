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

function parseProblemComment(text) {   
 var parsed = text.replace("Проблема:", "").trim().split(';');
    var stand = parsed[0].split(":")[1].trim();
	var problem = parsed[1].split(":")[1].trim();
	var comment = parsed[2] != undefined ? parsed[2].split(":")[1].trim(): "";
	var resultBlock=$('<div>', 
	{
		css:{
			width:'90%',
			display:'inline-block'
		}
	}).html('<b>Стенд: </b>' + stand
		+  "</br><b>Проблема: </b>" + problem
		+ (comment!= "" ? ("</br><b>Комментарий: </b>" + comment) : ""));

    return resultBlock
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


