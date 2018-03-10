
var currentSample;
var audioContext = new AudioContext();
var analyser = audioContext.createAnalyser();
var source;
var monitor=document.createElement('div');
var keyboardWrapper=document.getElementById('keyboardWrapper');
keyboardWrapper.style.height="20vh"

var keyboard=makeKeyboard(2,"keyBoard");
console.log(document, keyboard)
keyboard.addEventListener("keyDown", function( event ) {
   var t=event.target;
   console.log(t);
}, false);
keyboardWrapper.appendChild(keyboard);

monitor.id='monitor';

keyboardWrapper.appendChild(monitor);



navigator.mediaDevices.getUserMedia({audio:true})
	.then(stream => {
		rec = new MediaRecorder(stream);
      source = audioContext.createMediaStreamSource(stream);
      
   //source.connect(audioContext.destination);

		rec.ondataavailable = e => {
			audioChunks.push(e.data);
			if (rec.state == "inactive"){
        let blob = new Blob(audioChunks,{type:'audio/x-mpeg-3'});
        recordedAudio.src = URL.createObjectURL(blob);

        recordedAudio.playbackRate = 1;  
        currentSample=recordedAudio.src
            console.log("recordedAudio",recordedAudio)  ;  
            recordedAudio.autoplay=false;

        audioDownload.href = recordedAudio.src;
        audioDownload.download = 'mp3';
        audioDownload.innerHTML = 'download';
     } else{
      
     }
		}
	})
	.catch(e=>console.log(e));
  
startRecord.onclick = e => {
  startRecord.disabled = true;
  stopRecord.disabled=false;
  source.connect(analyser);
  audioChunks = [];
  rec.start();
}

stopRecord.onclick = e => {
   startRecord.disabled = false;
   stopRecord.disabled=true;
   rec.stop();
   source.disconnect(analyser);
}

var playNote=function(noteElement){ // either noteElement or className
    if (typeof noteElement==="string"){
        noteElement=document.getElementsByClassName(noteElement)[0];
    }
   let note=noteElement.dataset.id;
   let octave=noteElement.dataset.octave;
   console.log("playNote", octave,note );
   if (currentSample){

         //assume octave 4 with two octave range... middle C is original pitch...
      var cents=(octave-5)*1200+note*100;// assumes octave 4 is below pitch...
      console.log("cents",cents)
   bufferSound(audioContext, currentSample).then(function (buffer) {
      var src = audioContext.createBufferSource();
      var newValue= ((cents)/600);
      src.detune.setValueAtTime(cents, 0); 
      // console.log("src.playbackRate", newValue, "buffer", buffer)
      src.buffer = buffer;
      src.connect(analyser);
      src.connect(audioContext.destination);
      src.start();
   });
}
}

function bufferSound(ctx, url) {
  var p = new Promise(function(resolve, reject) {
    var req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.responseType = 'arraybuffer';
    req.onload = function() {
      ctx.decodeAudioData(req.response, resolve, reject);
    }
    req.send();
  });
  return p;
}


analyser.fftSize = 2048;
var bufferLength = analyser.frequencyBinCount;
var dataArray = new Uint8Array(bufferLength);
analyser.getByteTimeDomainData(dataArray);

// Get a canvas defined with ID "oscilloscope"
var canvas = document.getElementById("oscilloscope");
var canvasCtx = canvas.getContext("2d");

// draw an oscilloscope of the current audio source

function draw() {

  drawVisual = requestAnimationFrame(draw);

  analyser.getByteTimeDomainData(dataArray);

  canvasCtx.fillStyle = 'rgb(200, 200, 200)';
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

  canvasCtx.lineWidth = 2;
  canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

  canvasCtx.beginPath();

  var sliceWidth = canvas.width * 1.0 / bufferLength;
  var x = 0;

  for (var i = 0; i < bufferLength; i++) {

    var v = dataArray[i] / 128.0;
    var y = v * canvas.height / 2;

    if (i === 0) {
      canvasCtx.moveTo(x, y);
    } else {
      canvasCtx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  canvasCtx.lineTo(canvas.width, canvas.height / 2);
  canvasCtx.stroke();
};

draw();

















/*  Following code for audio context thanks to https://codepen.io/qur2/pen/emVQwW */



