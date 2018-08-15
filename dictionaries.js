var eventsDictionary = {
    readyForTestingDate: "Готова к тестированию",
    testingStartDate: "Начали тестировать",
    endOfTestingEstimateDate: "Планируем закончить тестирование",
    endOfTestingDate: "Закончили тестирование"
}

var tabsIds=[
		'check-list-review-block',
		'testing-dates-input-block',
		'problems-block',
		'automation-block',
		'card-members-edit-block'
]

var tabButtonsId = [
'add-dates-info-button',
'add-reviewers-button',
'edit-members-info-button',
'add-test-stands-problem-button',
'add-automation-info-button'
]

var buttonsIds=[
	'add-reviewer-submit-button',
    'ext-popup-submit',
    'comment-editing-save-button',
    'comment-editing-save-button',
    'automation-submit-button',
    'automation-cancel-button',
    'problems-block-submit-button',
    'problems-block-cancel-button',
    'pull-members-from-card'
	]

var additionalCommentsDictionary = {
    reviewComment: "Ревью",
    members: "Участники",
    automationComment: "Автоматизация",
    lackOfAutomationComment: "Причины недостаточной автоматизации",
}
var testStandsNums = [
    '01', '02', '03', '04', '05', '06', '07', '08', '09', '10',
    '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
    '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'
];

var automationInfoDictionary = {
    noAutomatization: "Не писали тесты",
    fullAutomatization: "Полностью покрыли функтестами",
    partialAutomatization: "Частично покрыли функтестами"
}
const otherProblemValue = "Другая проблема";

var lackOfAutomationReasonsDictionary = {
    IAmNoob: "Не пишу тесты",
    TestsAlreadyWriten: "Тесты уже написаны",
    dontKnowHowToWriteTestsForThisArea: "Не знаю как писать тесты на эту область",
    difficultScenarios: "Сложные сценарии",
    rareScenarios: "Редкие сценарии. Тесты не нужны",
    enoughAutomation: "Достаточно низкоуровневых тестов"
}