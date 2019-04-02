window.onload = function() {

	const Http = new XMLHttpRequest();
    const url='/getHistory';
    
    Http.open("GET", url);
    Http.send();

    Http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var history = JSON.parse(this.responseText);
            console.log(history);
            $('#print').text(JSON.stringify(history));
        }
    };
}

function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}