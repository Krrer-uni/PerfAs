const dropZone = document.getElementById('drop-zone');
const audioControls = document.getElementById('audio-controls');
const playPauseButton = document.getElementById('play-pause');
const seekBar = document.getElementById('seek-bar');
const textDisplay = document.getElementById('text-display');
const audioPlayer = document.getElementById('player')
const csvDropZone = document.getElementById('csv-drop')
const next_timestamp_text = document.getElementById('next_event')
let timestampsDisplay = document.getElementById('timestamps_list');

let audioContext;
let audioSource;
let audioPlaying = false;
let currentTime = 0;
let audioFileLoaded = false;
let csvFileLoaded = false;
let currentPlaybackTime = 0;
let timestamps;

function makeTimestampList(timestamps_list){
    timestampsDisplay = document.getElementById('timestamps_list');
    console.log(timestampsDisplay)
    timestampsDisplay.innerHTML = '';

    for (var i = 0; i < timestamps_list.length; i++){
        var item = document.createElement('li');
        
        timestamp_time = document.createTextNode(timestamps_list[i]["czas"])
        timestamp_time.id  = "timestamp_time"
        item.appendChild(timestamp_time)

        timestamp_text = document.createTextNode(" - " + timestamps_list[i]["akcja"])
        timestamp_text.id  = "timestamp_text"
        item.appendChild(timestamp_text)
        
        timestampsDisplay.appendChild(item)
    }
}

function setNextTimeStamp(id){
    var next_timestamp_text = document.getElementById('next_event')
    timestampsDisplay = document.getElementById('timestamps_list');
    for (var i = 0; i < timestamps.length;i++){
        if (id > i){
            timestampsDisplay.childNodes[i].id = "hidden"
        } else if(id == i){
            timestampsDisplay.childNodes[i].id = "next"
            if(id > 0){
            // timestampsDisplay.childNodes[i-1].id = "current"
            next_timestamp_text.textContent = timestamps[i-1]['czas'] +' - ' +timestamps[i-1]['akcja']

            }
        } else {
            timestampsDisplay.childNodes[i].id = "inactive"
            
        }
    }
}


// Function to handle drag and drop event
function handleDrop(event) {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    console.log(droppedFile)
    if (droppedFile.type.startsWith('audio/')) {
        loadAudioFile(droppedFile);
        if(csvFileLoaded){
            dropZone.hidden = true
        } else{
            dropZone.textContent = "Drop plan"
        }
    }else if(droppedFile.type.startsWith('text/')){
        loadCSVFile(droppedFile);
        if(audioFileLoaded){
            dropZone.hidden = true
        } else{
        dropZone.textContent = "Drop music"
        }
    }
     else {
        alert('Please drop an audio file.');
    }
}

function loadCSVFile(file){
    const reader = new FileReader();
    reader.onload = function (e) {
        const csvData = e.target.result;
        console.log(csvData)

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
        timestamps = result
        makeTimestampList(timestamps)
        console.log(result);
    }
    reader.readAsText(file)
    csvFileLoaded=true
}

function loadAudioFile(file) {
    audioContext = new AudioContext();
    audioSource = audioContext.createBufferSource();

    const reader = new FileReader();
    reader.onload = function (e) {
        audioContext.decodeAudioData(e.target.result, function (buffer) {
            // const blob = new Blob([arrayBuffer], { type: "audio/wav" });
            // const url = window.URL.createObjectURL(blob);
            // audioPlayer.src =
            audioPlayer.src = file.name
            audioSource.buffer = buffer;
            audioSource.connect(audioContext.destination);
            audioFileLoaded = true;
            // Add code to handle timestamps and text display here
        });
    };
    reader.readAsArrayBuffer(file);
    audioFileLoaded = true
}

dropZone.addEventListener('dragover', function (event) {
    event.preventDefault();
});
dropZone.addEventListener('drop', handleDrop);

audioPlayer.ontimeupdate = function() {
    currentPlaybackTime = audioPlayer.currentTime
    current_timestamp = 0;
    for (let i = 0; i < timestamps.length; i++){
        time = timestamps[i]["czas"]
        times = time.split(':');
        time_sec = parseInt(times[1]) + parseInt(times[0]) * 60
        if(time_sec >= currentPlaybackTime){
            setNextTimeStamp(i)
            console.log(time_sec)
            break;
        }
        current_timestamp = i;
    }
    // timer = document.getElementById('play_timer')
    // timer.textContent = parseFloat(currentPlaybackTime).toFixed(1)
    updatePlayTimer()
    console.log(currentPlaybackTime);
}

function updatePlayTimer(){
    currentPlaybackTime = audioPlayer.currentTime
    timer = document.getElementById('play_timer')
    sec = (parseInt(currentPlaybackTime) % 60)
    min = Math.floor(currentPlaybackTime / 60)
    if(sec < 10){
        text = String(min) + ":0" + String(sec)

    }else{
    text = String(min) + ":" + String(sec)

    }
    // console.log(text)
    timer.textContent = text
}