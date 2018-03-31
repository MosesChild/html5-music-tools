var audioContext = audioContext ? audioContext : new AudioContext();
var lastSample;

/*
problem : making sure that new components get added to setup properly so that function binding can occur...

perhaps we need an MutationOberver to see new components...
 or better if we call a "universal" function that handles new devices being added:

when component added
  check all other component instances
  if ambiguous addition... 
    alert and force user to make connection/insertion...
  else add to current components...

  requirements... 
  every component must be able to rebind on request.
  every component should have audioContext in and out...

*/
const setupMediaStreamRecorder = targetAudioElement => {

  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then(stream => {
      recorder = new MediaRecorder(stream);
      source = audioContext.createMediaStreamSource(stream);
      
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
          console.log( "controller",targetAudioElement.controller,"audioTracks",targetAudioElement.audioTracks)
          //source.connect(AnalyserNode);
          makeSample(targetAudioElement);
          updatePatchList();
        }
      };
    })
    .catch(e => console.log(e));
};
const makeSample = targetAudioElement => {
  //console.log(targetAudioElement);
  const newSample = targetAudioElement.cloneNode(true);
  const id = defaultInstance("sample");
  const sampleWrapper = createElement("div", { className: "sampleWrapper" });
  const patchName = createElement("span", {textContent: id, className:"patch"});
  const sampleTrigger = createElement("span", { className: "key" });
  //console.log(newSample.audioContext);
  patchName.dataset.id=id;
 // newSample.connect(AnalyserNode);
  sampleTrigger.dataset.midinote = "C4";
  sampleTrigger.dataset.octave = "4";
  sampleTrigger.dataset.id = "0";
  newSample.id = id;
  newSample.className = "sample";

  newSample.controls = true;

  const playButton = sampleWrapper.appendChild(
    createElement("a", "playSample")
  );
  playButton.onclick = e => {
    console.log("clicked");
    voice(newSample.src);
  };
  playButton.appendChild(
    createElement("i", {
      className: "material-icons",
      textContent: "play_arrow"
    })
  );
  sampleWrapper.appendChild(patchName);
  sampleWrapper.appendChild(newSample);

  sampleWrapper.appendChild(playButton);
  sampleWrapper.appendChild(sampleTrigger);

  lastSample = newSample; // global variable enables trigger to last sample without explicit link...
  targetAudioElement.parentNode.appendChild(sampleWrapper);
};

function toggleRecord(analyser, e) {
  /*'bind' at sampler.init() : this='recorder' instance (mediaDevice for start/stop), 
                                      analyser = sampler.scope.analyser for canvas visual */

  console.log("toggleRecord", arguments);
  var icon = e.target.closest("i");
  icon.classList.toggle("record");
  if (icon.textContent === "fiber_manual_record") {
    icon.textContent = "stop";
    source.connect(analyser);
    audioChunks = [];
    recorder.start();
  } else {
    source.disconnect(analyser);
    recorder.stop();
    icon.textContent = "fiber_manual_record";
  }
}

function makeSampler() {
  const id = defaultInstance("sampler");
  const samplerInterface = createElement("div", {
    id: id,
    className: "sampler"
  });
  const wrapper = draggableComponentWrapper(samplerInterface, id);
  const oscilloscope = makeScope(id + "scope");
  const scope = oscilloscope.canvas;
  const analyser = oscilloscope.analyser;
  //const container=document.body.appendChild(makeSamplerInterface(id));
  const recordButton = createMaterialIconButton(
    "recordToggle",
    "fiber_manual_record"
  );
  const sampleList = createElement("div", {
    id: id + "_samples",
    className: "sampleList"
  });
  const recordedAudio = createElement("audio", { id: id + "_recordedAudio" });
  const recorder = setupMediaStreamRecorder(recordedAudio);
  const boundToggleRecord = toggleRecord.bind(recorder, analyser);
  //const toggleRecordButton=$("#"+id+"_recordToggle").onclick=boundToggleRecord;
  recordButton.className = "recordToggle";
  var sampler = {
    id,
    audioContext,
    //   container,
    recordedAudio,
    scope
  };
  wrapper.appendChild(samplerInterface);
  samplerInterface.appendChild(scope);
  samplerInterface.appendChild(recordButton);
  wrapper.appendChild(sampleList);
  sampleList.appendChild(recordedAudio);
  recordButton.onclick = boundToggleRecord;

  // recordButton.className="recordToggle";
  recordButton.firstChild.classList.toggle("record");

  //container.appendChild(scope.canvas);
  document.body.appendChild(wrapper);
  voice = voice.bind(sampler, analyser);
  //makeSample= makeSample.bind(sampler);
  return sampler;
}

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
  console.log("voice", arguments);
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
}
/* a generic audio-voice out. AdjustmentFunction is an optional callback (a hook) that can 
adjust the internal playback parameters with 'src'... Currently used by playNote */

/* playNote will accept piano keyboard input.  Currently triggered by sending '.key' DOM nodes...  It uses
the keyboardSamplerConversion helper to create an appropriate detune value that can then be consumed by an 'adjustmentFunction'
on the voice callback.
*/
const playNote = function(noteElement, sound) {
  const cents = keyboardSamplerConversion(noteElement);
  callback = src => src.detune.setValueAtTime(cents, 0);
  const currentSound = sound ? sound : lastSample ? lastSample.src : null;
  if (currentSound) {
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
