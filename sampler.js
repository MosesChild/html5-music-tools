var audioContext = audioContext ? audioContext : new AudioContext();
var lastSample;

const setupMediaStreamRecorder = targetAudioElement => {
  navigator.mediaDevices
    .getUserMedia({ audio: true })

    .then(stream => {
      recorder = new MediaRecorder(stream);
      source = audioContext.createMediaStreamSource(stream);
      //  source.connect(audioContext.destination);
      recorder.ondataavailable = e => {
        audioChunks.push(e.data);
        if (recorder.state == "inactive") {
          // console.log(targetAudioElement.parentNode)
          let blob = new Blob(audioChunks, { type: "audio/x-mpeg-3" });
          const sampler = targetAudioElement.parentNode;
          targetAudioElement.src = URL.createObjectURL(blob);
          targetAudioElement.controls = false;
          targetAudioElement.playbackRate = 1;
          targetAudioElement.autoplay = false;
          saveSample(targetAudioElement);
        }
      };
    })
    .catch(e => console.log(e));
};
function saveSample(targetAudioElement) {
  console.log(targetAudioElement);
 const id=defaultInstance("sample");
 const sampleWrapper = createElement("div", { id: id, className: "sample" });
 const sampleTrigger= createElement("span", { textContent: id, className:"key"});
 sampleTrigger.dataset.midinote="C4"
 sampleTrigger.dataset.octave= "4"
 sampleTrigger.dataset.id="0";

 sampleTrigger.onclick=()=>{callback = boundaddKeyToActiveStepTriggerList()?
  boundaddKeyToActiveStepTriggerList(sampleTrigger): 
  ()=> voice(newSample.src);
  callback();
}
 const newSample = sampleWrapper.appendChild(targetAudioElement.cloneNode(true));
 const playButton=sampleWrapper.appendChild(createElement("button", "playSample"));
 
 playButton.onclick= e =>{
   console.log("clicked");
  voice(newSample.src)
};
 playButton.appendChild(createElement("i", {className:"material-icons", textContent:"play_arrow"}))
 sampleWrapper.appendChild(sampleTrigger)
 sampleWrapper.appendChild(newSample)
 sampleWrapper.appendChild(playButton);

 lastSample = newSample; // global variable enables trigger to last sample without explicit link...

 targetAudioElement.parentNode.appendChild(sampleWrapper);
}

function toggleRecord(analyser, e) { /*'bind' at sampler.init() : this='recorder' instance (mediaDevice for start/stop), 
                                      analyser = sampler.scope.analyser for canvas visual */   
  console.log("toggleRecord", arguments);
  console.log("source", source, analyser);
  function _changeIcon(icon, color, materialIconName) {
    // console.log(arguments);
    icon.style.color = color;
    icon.textContent = materialIconName;
  }
  var icon = e.target.closest("i");

  if (icon.textContent === "fiber_manual_record") {
    source.connect(analyser);
    audioChunks = [];
    recorder.start();
    _changeIcon(icon, "black", "stop");
  } else {
    source.disconnect(analyser);
    recorder.stop();
    _changeIcon(icon, "red", "fiber_manual_record");
  }
}

var instance = 0;

function makeSamplerPanel(){
  const buttons = [["recordToggle" + instance, "fiber_manual_record"],
  ["play" + instance, "play_arrow"]];
  var panel = createPanel(buttons, instance);
  panel.appendChild(createElement("audio", {id:"recordedAudio"}));
  panel.firstChild.style.color = "red";
  return panel;
}
function makeSamplerContainer(){
  const samplerWrapper = createElement("div", { id: "sampler" + instance, className: "sampler" });
  return samplerWrapper;
}

const makeSampler = (thisName = `sampler${instance}`) =>
  ({
    audioContext: audioContext,
    samplerName: thisName,
    scope: makeScope(audioContext),
    panel: document.body.appendChild(makeSamplerPanel()),
    container: document.body.appendChild(makeSamplerContainer()),
    sampleNote: 0,
    sampleOctave: 4,
    
    init() {
      this.recordedAudio=$('#recordedAudio');
      this.container.appendChild(this.scope.canvas);
      voice=voice.bind(this,this.scope.analyser);
      // should create a 'source' node on this object bound to stream...
      const recorder = setupMediaStreamRecorder(this.recordedAudio);
      this.toggleRecord = toggleRecord.bind(recorder, this.scope.analyser);
      this.saveSample=saveSample.bind(this);
      document
        .getElementById(`recordToggle${instance}`)
        .addEventListener("click", this.toggleRecord, false);
      instance++;
    }
  }.init());


/* a helper function to work with a keyboard... it uses dataset.octave and dataset.id (a value 0-11 that represents 
    "C" to "B") to create a detune value (in cents).  A 'C' value is the default value of the original sample.
*/
const keyboardSamplerConversion = noteElement => {
  const note = noteElement.dataset.id;
  const octave = noteElement.dataset.octave;
  const cents = (octave - 4) * 1200 + note * 100; // assumes octave 4 is below pitch...

  //console.log("playNote", octave, note);
  //assume octave 4 with two octave range... middle C is original pitch...;
  // so create a default range with keyboard splitting note range both above and below...

  return cents;
};
function voice(analyser, sample, adjustmentFunction) {
  console.log("voice",arguments);
  if (sample) {
    bufferSound(audioContext, sample).then(function(buffer) {
      var src = audioContext.createBufferSource();
      if (adjustmentFunction) {
        adjustmentFunction(src);
      }
      src.buffer = buffer;
      src.connect(analyser);
      src.connect(audioContext.destination);
      src.start();
    });
  }
};
/* a generic audio-voice out. AdjustmentFunction is an optional callback (a hook) that can 
adjust the internal playback parameters with 'src'... Currently used by playNote */

/* playNote will accept piano keyboard input.  Currently triggered by sending '.key' DOM nodes...  It uses
the keyboardSamplerConversion helper to create an appropriate detune value that can then be consumed by an 'adjustmentFunction'
on the voice callback.
*/
const playNote = function(noteElement, sound) {
  const cents = keyboardSamplerConversion(noteElement);
  callback = src => src.detune.setValueAtTime(cents, 0);
  const currentSound= sound ? sound :
    lastSample ? lastSample.src : null;
  if (currentSound){
    voice(currentSound, callback);
  }
};


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
