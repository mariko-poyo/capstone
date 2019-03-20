window.onload = function() {

	const Http = new XMLHttpRequest();
    const url='/getHistory';
    
    Http.open("GET", url);
    Http.send();
}