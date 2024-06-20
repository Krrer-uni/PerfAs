const dropZone = document.getElementById('drop-zone');
const audioControls = document.getElementById('audio-controls');
const playPauseButton = document.getElementById('play-pause');
const seekBar = document.getElementById('seek-bar');
const textDisplay = document.getElementById('text-display');
const audioPlayer = document.getElementById('player');
const player_forward = document.getElementById('player_forward')
const player_backward = document.getElementById('player_backward')
const csvDropZone = document.getElementById('csv-drop');
const next_timestamp_text = document.getElementById('next_event');
const player_controls = document.getElementById('player_controls');

let timestampsDisplay = document.getElementById('timestamps_list');

let audioContext;
let audioSource;
let audioPlaying = false;
let currentTime = 0;
let audioFileLoaded = false;
let csvFileLoaded = false;
let currentPlaybackTime = 0;
let timestamps;
let ALERT_TIME = 60;
function makeTimestampList(timestamps_list) {
    timestampsDisplay = document.getElementById('timestamps_list');
    timestampsDisplay.innerHTML = '';

    for (var i = 0; i < timestamps_list.length; i++) {
        var item = document.createElement('li');
        item.className = "timestamp-item";
        item.dataset.index = i;

        let current_time = timestamps_list[i]["czas"];

        let timestampTimeText = document.createElement('span');
        timestampTimeText.className = "timestamp-time";
        timestampTimeText.textContent = current_time;
        item.appendChild(timestampTimeText);

        let timestampText = document.createElement('span');
        timestampText.className = "timestamp-text";
        timestampText.textContent = " - " + timestamps_list[i]["akcja"];
        item.appendChild(timestampText);

        let deltaSpan = document.createElement('span');
        deltaSpan.className = "delta-time";
        item.appendChild(deltaSpan);

        timestampsDisplay.appendChild(item);
    }
}

function updateTimeStamps(id,time) {
    let currentTime = audioPlayer.currentTime;
    var next_timestamp_text = document.getElementById('next_event');
    timestampsDisplay = document.getElementById('timestamps_list');
    for (var i = 0; i < timestamps.length; i++) {
        let item = timestampsDisplay.childNodes[i];
        let timestamp = timestamps[i]["czas"];
        let times = timestamp.split(':');
        let timestampSeconds = parseInt(times[1]) + parseInt(times[0]) * 60;
        if (id > i) {
            item.className = "timestamp-item hidden";
        } else if (id == i) {
            item.className = "timestamp-item next";
            if (id > 0) {
                next_timestamp_text.textContent = timestamps[i - 1]['czas'] + ' - ' + timestamps[i - 1]['akcja'];
            }
        } else if(timestampSeconds - currentTime  < ALERT_TIME) {
            item.className = "timestamp-item incoming";
        } else{
            item.className = "timestamp-item inactive";
        }

    }
}

function updateDeltaTimes() {
    let currentTime = audioPlayer.currentTime;
    let timestampItems = document.querySelectorAll('.timestamp-item');

    timestampItems.forEach(item => {
        let index = item.dataset.index;
        let timestamp = timestamps[index]["czas"];
        let times = timestamp.split(':');
        let timestampSeconds = parseInt(times[1]) + parseInt(times[0]) * 60;
        let deltaSeconds = timestampSeconds - currentTime;

        let deltaMinutes = Math.floor(deltaSeconds / 60);
        let deltaRemainderSeconds = Math.floor(deltaSeconds % 60);

        let deltaText = `(${deltaMinutes}:${deltaRemainderSeconds < 10 ? '0' : ''}${deltaRemainderSeconds})`;
        item.querySelector('.delta-time').textContent = deltaText;
    });
}

// Function to handle drag and drop event
function handleDrop(event) {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile.type.startsWith('audio/')) {
        loadAudioFile(droppedFile);
        if (csvFileLoaded) {
            dropZone.hidden = true;
        } else {
            dropZone.textContent = "Drop plan";
        }
    } else if (droppedFile.type.startsWith('text/')) {
        loadCSVFile(droppedFile);
        if (audioFileLoaded) {
            dropZone.hidden = true;
        } else {
            dropZone.textContent = "Drop music";
        }
    } else {
        alert('Please drop an audio file.');
    }
}

function loadCSVFile(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        const csvData = e.target.result;

        const lines = csvData.split('\n');
        const result = [];

        const headers = lines[0].split(';');

        for (let i = 1; i < lines.length; i++) {
            const obj = {};
            const currentline = lines[i].split(';');

            headers.forEach((header, index) => {
                obj[header] = currentline[index];
            });

            result.push(obj);
        }
        timestamps = result;
        makeTimestampList(timestamps);
    }
    reader.readAsText(file);
    csvFileLoaded = true;
}

function loadAudioFile(file) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioSource = audioContext.createBufferSource();

    const reader = new FileReader();
    reader.onload = function (e) {
        audioContext.decodeAudioData(e.target.result, function (buffer) {
            audioPlayer.src = file.name;
            audioSource.buffer = buffer;
            audioSource.connect(audioContext.destination);
            audioFileLoaded = true;
        });
    };
    reader.readAsArrayBuffer(file);
    audioFileLoaded = true;
}

dropZone.addEventListener('dragover', function (event) {
    event.preventDefault();
});
dropZone.addEventListener('drop', handleDrop);

audioPlayer.ontimeupdate = function() {
    currentPlaybackTime = audioPlayer.currentTime;
    current_timestamp = 0;
    for (let i = 0; i < timestamps.length; i++) {
        let time = timestamps[i]["czas"];
        let times = time.split(':');
        let time_sec = parseInt(times[1]) + parseInt(times[0]) * 60;
        if (time_sec >= currentPlaybackTime) {
            updateTimeStamps(i);
            break
        }
        current_timestamp = i;
    }
    updatePlayTimer();
    updateDeltaTimes();
}

function updatePlayTimer() {
    currentPlaybackTime = audioPlayer.currentTime;
    let timer = document.getElementById('play_timer');
    let sec = (parseInt(currentPlaybackTime) % 60);
    let min = Math.floor(currentPlaybackTime / 60);
    let text = (sec < 10) ? `${min}:0${sec}` : `${min}:${sec}`;
    timer.textContent = text;
}
player_forward.addEventListener('click',function(){
    audioPlayer.currentTime += 1
})

player_backward.addEventListener('click',function(){
    audioPlayer.currentTime -= 1
})


// Initialize the delta time updates every second
setInterval(updateDeltaTimes, 1000);
