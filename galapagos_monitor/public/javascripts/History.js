// Called when /history is loaded
window.onload = function() {

	const Http = new XMLHttpRequest();
    const url='/getHistory';
    
    Http.open("GET", url);
    Http.send();

    Http.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // Get history
            var history = JSON.parse(this.responseText);
            // console.log(history);
            $('#print').text(JSON.stringify(history));
        }
    };
}

// Helper function for json
function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

// Cookies related functions
function setCookie(cname, cvalue, exdays, path) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path="+path+';';
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function deleteCookie(cname) {
    var cookie = getCookie(cname);
    if (cookie != "") {
        document.cookie = cname + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    } else {
        console.log("Error: Cookie %s does not exist.", cname);
    }
}

function checkCookie(cname) {
    return getCookie(cname) != "";
}