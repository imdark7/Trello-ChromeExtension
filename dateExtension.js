Date.prototype.toFullDateString = function() {
    return this.toLocaleString().slice(0, -3).replace(',', '');
};
function getDateFromString(string) {
    var splitedString = string.replace(" ", ".").split(".");
    return new Date(splitedString[2] + '-' + splitedString[1] + '-' + splitedString[0] + ' ' + splitedString[3]);
}

function getCurrentDate(){
	var date = new Date();
	return date.getFullYear() + '-' +
        pad(date.getMonth() + 1, 2) + '-' +
        pad(date.getDate(), 2) + 'T' +
        pad(date.getHours(), 2) + ':' + pad(date.getMinutes(), 2);
}

function pad(a, b) {
    return (1e15 + a + "").slice(-b);
}