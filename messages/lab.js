request = new XMLHttpRequest();

function parse() {
	request.open("GET", "data.json", true);

	request.onreadystatechange = function() {
		if (request.readyState == 4 && request.status == 200) {
			data = request.responseText;
			msg = JSON.parse(data);
			elem = document.getElementById("messages");
			elem.innerHTML = "";
			for (var i = 0; i < 2; i++) {
				elem.innerHTML = elem.innerHTML + "<p> <span class='message'>" + msg[i]["content"] + "<span class='author'>" + msg[i]["username"] + "</span>" + "</span> </p>";
			}
		}
	};
	request.send(null);
}