
var currentSample;
var audioContext = audioContext ? audioContext : new AudioContext;
//var analyser = audioContext.createAnalyser();
var source;
var monitor = document.createElement("div");
document.body.appendChild(monitor);
//makeKeyboard(2, "keyboardWrapper", 1);
/* Requirements :
instance 'id'.
local object 'currentSample'
    */

const createSamplerInstance = () => {
  const panel = document.createElement("p");
  buttons=[["startRecord", "fiber_manual_record"],["stopRecord","stop"],
    ["play","play_arrow"],["audioDownload","file_download"]];
  buttons.forEach(button=>{
      let btn=document.createElement("button");
      let icon=document.createElement("i");
      btn.id=button[0];
      icon.textContent=button[1];
      icon.className="material-icons";
      btn.appendChild(icon);
      panel.appendChild(btn);
  });
  let audio=document.createElement("audio");
  audio.id="recordedAudio";
  panel.appendChild(audio);
  document.body.appendChild(panel);
  document.getElementById("audioDownload").style.opacity=0;
};

createSamplerInstance();

navigator.mediaDevices
  .getUserMedia({ audio: true })
  .then(stream => {
    rec = new MediaRecorder(stream);
    source = audioContext.createMediaStreamSource(stream);

    //source.connect(audioContext.destination);

    rec.ondataavailable = e => {
      audioChunks.push(e.data);
      if (rec.state == "inactive") {
        let blob = new Blob(audioChunks, { type: "audio/x-mpeg-3" });
        recordedAudio.src = URL.createObjectURL(blob);

        recordedAudio.playbackRate = 1;
        currentSample = recordedAudio.src;
        console.log("recordedAudio", recordedAudio);
        recordedAudio.autoplay = false;

        audioDownload.href = recordedAudio.src;
        audioDownload.download = "mp3";
        audioDownload.style.opacity=1;
      } else {
      }
    };
  })
  .catch(e => console.log(e));

window.onload = () => {

startRecord.onclick = e => {
  startRecord.disabled = true;
  stopRecord.disabled = false;
  source.connect(analyser);
  audioChunks = [];
  rec.start();
};

stopRecord.onclick = e => {
  startRecord.disabled = false;
  stopRecord.disabled = true;
  rec.stop();
  source.disconnect(analyser);
};
play.onclick = e => {
  voice();
};

}
const keyboardConvertObj = (noteElement) => {
  const note = noteElement.dataset.id;
  const octave = noteElement.dataset.octave;
  console.log("playNote", octave, note);
  //assume octave 4 with two octave range... middle C is original pitch...;
  // so create cents value and scale
  const cents = (octave-2) * 1200 + note * 100; // assumes octave 4 is below pitch...
  return cents;
};

const voice = (adjustmentFunction) => {
  // pre requisites:
  // assign an audio-clip to this event...
  // if available...
  if (currentSample) {
    bufferSound(audioContext, currentSample).then(function(buffer) {
      var src = audioContext.createBufferSource();
      if (adjustmentFunction) {
        adjustmentFunction(src);
      }
      // console.log( "buffer", buffer)
      src.buffer = buffer;
      src.connect(analyser);
      src.connect(audioContext.destination);
      src.start();
    });
  }
};
const playNote = function (noteElement){
 const cents=keyboardConvertObj(noteElement);
 callback= (src)=>src.detune.setValueAtTime(cents, 0);
 voice(callback);
}
/* playNote will playback piano keyboard DOM nodes...  Ultimately it is using
the dataset.octave and dataset.id (a value 0-11 that represents "C" to "B");
a C value for original source is currently assumed.

*/
function bufferSound(ctx, url) {
  var p = new Promise(function(resolve, reject) {
    var req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.responseType = "arraybuffer";
    req.onload = function() {
      ctx.decodeAudioData(req.response, resolve, reject);
    };
    req.send();
  });
  return p;
}
