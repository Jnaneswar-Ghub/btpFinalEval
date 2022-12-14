var langs = [
	['English', ['en-AU', 'Australia'], ['en-CA', 'Canada'],
		['en-IN', 'India'], ['en-KE', 'Kenya'],
		['en-TZ', 'Tanzania'], ['en-GH', 'Ghana'],
		['en-NZ', 'New Zealand'], ['en-NG', 'Nigeria'],
		['en-ZA', 'South Africa'], ['en-PH', 'Philippines'],
		['en-GB', 'United Kingdom'], ['en-US', 'United States']],
	['Español', ['es-AR', 'Argentina'], ['es-BO', 'Bolivia'],
		['es-CL', 'Chile'], ['es-CO', 'Colombia'],
		['es-CR', 'Costa Rica'], ['es-EC', 'Ecuador'],
		['es-SV', 'El Salvador'], ['es-ES', 'España'],
		['es-US', 'Estados Unidos'], ['es-GT', 'Guatemala'],
		['es-HN', 'Honduras'], ['es-MX', 'México'],
		['es-NI', 'Nicaragua'], ['es-PA', 'Panamá'],
		['es-PY', 'Paraguay'], ['es-PE', 'Perú'],
		['es-PR', 'Puerto Rico'],
		['es-DO', 'República Dominicana'], ['es-UY', 'Uruguay'],
		['es-VE', 'Venezuela']],
	['ಕನ್ನಡ', ['kn-IN']],
	['മലയാളം', ['ml-IN']],
	['मराठी', ['mr-IN']],
	['தமிழ்', ['ta-IN', 'இந்தியா'], ['ta-SG', 'சிங்கப்பூர்'],
		['ta-LK', 'இலங்கை'], ['ta-MY', 'மலேசியா']],
	['తెలుగు', ['te-IN']],
	['हिन्दी', ['hi-IN']]];

for (var i = 0; i < langs.length; i++) {
	select_language.options[i] = new Option(langs[i][0], i);
}

select_language.selectedIndex = 0;
updateCountry();
select_dialect.selectedIndex = 0;
showInfo('info_start');

function updateCountry() {
	for (var i = select_dialect.options.length - 1; i >= 0; i--) {
		select_dialect.remove(i);
	}
	var list = langs[select_language.selectedIndex];
	for (var i = 1; i < list.length; i++) {
		select_dialect.options.add(new Option(list[i][1], list[i][0]));
	}
	select_dialect.style.visibility = list[1].length == 1 ? 'hidden' : 'visible';
}

var final_transcript = '';
var recognizing = false;
var ignore_onend;
var start_timestamp;
if (!('webkitSpeechRecognition' in window)) {
	upgrade();
} else {
	start_button.style.display = 'inline-block';
	var recognition = new webkitSpeechRecognition();
	recognition.continuous = true;
	recognition.interimResults = true;

	recognition.onstart = function() {
		recognizing = true;
		showInfo('info_speak_now');
	};

	recognition.onerror = function(event) {
		if (event.error == 'no-speech') {
			showInfo('info_no_speech');
			ignore_onend = true;
		}
		if (event.error == 'audio-capture') {
			showInfo('info_no_microphone');
			ignore_onend = true;
		}
		if (event.error == 'not-allowed') {
			if (event.timeStamp - start_timestamp < 100) {
				showInfo('info_blocked');
			} else {
				showInfo('info_denied');
			}
			ignore_onend = true;
		}
		removeClassById("micIcon", "pulse");
		removeClassById("micIcon", "circle")
	};

	recognition.onend = function() {
		recognizing = true;
		if (ignore_onend) {
			return;
		}
		if (!final_transcript) {
			return;
		}
		if (window.getSelection) {
			window.getSelection().removeAllRanges();
			var range = document.createRange();
			range.selectNode(document.getElementById('final_span'));
			window.getSelection().addRange(range);
			removeMicStyle();
			showInfo('info_start');
		}
	};

	recognition.onresult = function(event) {
		var interim_transcript = '';
		if (typeof (event.results) == 'undefined') {
			recognition.onend = null;
			recognition.stop();
			upgrade();
			return;
		}
		for (var i = event.resultIndex; i < event.results.length; ++i) {
			if (event.results[i].isFinal) {
				if(isMobile()){
					final_transcript = event.results[i][0].transcript;
				} else {
					final_transcript += event.results[i][0].transcript;
				}
			} 
			else {
				if(isMobile()){
					interim_transcript = event.results[i][0].transcript;
				} else {
					interim_transcript += event.results[i][0].transcript;
				}
			}
		}
		final_transcript = capitalize(final_transcript);
		final_span.innerHTML = linebreak(final_transcript);
		interim_span.innerHTML = linebreak(interim_transcript);
	};
}

function upgrade() {
	start_button.style.visibility = 'hidden';
	showInfo('info_upgrade');
}

function isMobile(){
	return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
	return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}

var first_char = /\S/;
function capitalize(s) {
	return s.replace(first_char, function(m) {
		return m.toUpperCase();
	});
}

function startButton(event) {
	if (recognizing) {
		recognition.stop();
		removeMicStyle();
		recognizing = false;
		showInfo('info_start');
		return;
	}
	final_transcript = '';
	recognition.lang = select_dialect.value;
	recognition.start();
	ignore_onend = false;
	final_span.innerHTML = '';
	interim_span.innerHTML = '';
	addMicStyle();
	showInfo('info_allow');
	start_timestamp = event.timeStamp;
}

function showInfo(s) {
	if (s) {
		for (var child = info.firstChild; child; child = child.nextSibling) {
			if (child.style) {
				child.style.display = child.id == s ? 'inline' : 'none';
			}
		}
		info.style.visibility = 'visible';
	} else {
		info.style.visibility = 'hidden';
	}
}

function removeMicStyle() {
	removeClassById("micIcon", "pulse");
	removeClassById("micIcon", "circle");
}

function addMicStyle(){
	addClassById("micIcon", "pulse");
	addClassById("micIcon", "circle");
}

function removeClassById(elementId, className) {
	var element = document.getElementById(elementId);
	element.classList.remove(className);
}

function addClassById(elementId, className) {
	var element = document.getElementById(elementId);
	element.classList.add(className);
}
