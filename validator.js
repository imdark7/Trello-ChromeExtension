function isValidDate(eventType, dateTime) {
    switch (eventType) {

        case eventsDictionary.readyForTestingDate:
            var nextDate = getDateIfExist(eventsDictionary.testingStartDate);
            if (nextDate && dateTime > nextDate) {
                $('#error-message').text('Дата готовности не может быть позже даты начала');
                return;
            }
            break;

        case eventsDictionary.testingStartDate:
            var previousDate = getDateIfExist(eventsDictionary.readyForTestingDate);
            if (!previousDate) {
                $('#error-message').text('Сперва заполните дату готовности к тестированию');
                return;
            }
            if (previousDate > dateTime) {
                $('#error-message').text('Дата начала не может быть раньше даты готовности к тестированию');
                return;
            }

            var nextDate = getDateIfExist(eventsDictionary.endOfTestingEstimateDate);
            if (nextDate && dateTime > nextDate) {
                $('#error-message').text('Дата начала не может быть позже предпологаемой даты окончания');
                return;
            }
            nextDate = getDateIfExist(eventsDictionary.endOfTestingDate);
            if (nextDate && dateTime > nextDate) {
                $('#error-message').text('Дата начала не может быть позже даты окончания');
                return;
            }
            break;

        case eventsDictionary.endOfTestingEstimateDate:
            var previousDate = getDateIfExist(eventsDictionary.testingStartDate);
            if (!previousDate) {
                $('#error-message').text('Сперва заполните дату начала тестирования');
                return;
            }
            if (previousDate > dateTime) {
                $('#error-message').text('Предпологаемая дата окончания не может быть раньше даты начала');
                return;
            }
            break;

        case eventsDictionary.endOfTestingDate:
            var previousDate = getDateIfExist(eventsDictionary.endOfTestingEstimateDate);
            if (!previousDate) {
                $('#error-message').text('Сперва заполните планируемую дату окончания тестирования');
                return;
            }
            previousDate = getDateIfExist(eventsDictionary.testingStartDate);
            if (previousDate > dateTime) {
                $('#error-message').text('Дата окончания не может быть раньше даты начала');
                return;
            }
            break;
    }
    return true;
}

function getDateIfExist(eventType) {
    var dateString = doesTheCommentExist(eventType);
    if (dateString) {
        return getDateFromString(dateString[0].text.slice(-17));
    }
    return;
}