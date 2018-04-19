
const notes = {
  sharpScale: [
    "C", "Csharp", "D", "Dsharp", "E", "F", "Fsharp", 
    "G", "Gsharp", "A", "Asharp", "B", "C"],

  flatScale: [ "C", "Db", "D", "Eb", "E", "F", "Gb",
               "G", "Ab", "A", "Bb", "B", "C" ]
};

function selectWholeKey(midinote){
  return document.querySelectorAll(`.key[data-midinote=${midinote}]`)
}

const eventListeners = { 
  keyPressed(event) {
    if (event.buttons & 1) {
      selectWholeKey(event.target.dataset.midinote).forEach(
        part => (part.className += " pressed")
      );
      playNote(event.target);
    }
  },
  keyReleased(event) {
    selectWholeKey(event.target.dataset.midinote).forEach(part =>
      part.classList.remove("pressed")
    );
  //  if (releaseNote!=='undefined'){
    //  releaseNote(event.target);
//    }
  },
}
const samplerPatchWindow={
  patchListener(e) {
    const patches = e.target.parentNode;
    const patchName = e.target.value;
    console.log("parent", patches, "patchName", patchName);
    let selected=patches.removeChild(e.target);
    let newList=patches.insertBefore(selected,patches.firstChild);
    lastSample=$("#"+selected.value);
  },

  updatePatchList(){
    const patchNames = getPatchNames();
    const patchList = $(".patchList");
    while (patchList.hasChildNodes()) {
      patchList.removeChild(patchList.lastChild);
    }
    const buttons = makeButtons(patchNames);
    buttons.forEach(button => patchList.appendChild(button));
  },

  getPatchNames(){
    var sampleElements = document.getElementsByClassName("sample");
    var sampleNames = [];
    if (!sampleElements) {
      return;
    }
    for (sample of sampleElements) {
      console.log(sample);
      sampleNames.push(sample.id);
    }
    console.log("patchNames", sampleNames);
    return sampleNames;
  }
}

const makeFreqTable = (cents)=>{
  const nthroot = function(x, n) {
    //if x is negative function returns NaN
    return Math.exp(1 / n * Math.log(x));
  };
  // ready for tuning!
  var prevValue = 27.5;
  var root2 = nthroot(2, 12);
  var cent = nthroot(2, 1200);
  var table = [];
  if (cents) {
    for (var c = 0; c < cents; c++) {
      prevValue = cent * prevValue;
    }
  }
  for (let i = 0; i < 96; i++) {
    table.push(prevValue);
    prevValue = prevValue * root2;
  }
  return table;
}

const Module={
  name:"keyboardMaker",
  octaves: null,// set at makeKeyboard() or defaults to two octaves.
  octaveStart: null, //set at makeKeyboard() or centers octaves at calculateRange
  freqTable: makeFreqTable(),
makeKey (id, octaveNumber){ // used as the base for all keyboard keys.
  var key = createElement("div", {className : "key"})
  key.dataset.midinote = notes.sharpScale[id] + "" + octaveNumber;
  key.dataset.id = id;
  key.dataset.octave = octaveNumber;
  key.dataset.frequency = this.freqTable[octaveNumber * 12 + id];

  key.addEventListener("mousedown", eventListeners.keyPressed, false);
  key.addEventListener("mouseup", eventListeners.keyReleased, false);
  key.addEventListener("mouseover", eventListeners.keyPressed, false);
  key.addEventListener("mouseleave", eventListeners.keyReleased, false);
  return key;
},

makeStems(id, octaveNumber){
  var note = this.makeKey(id, octaveNumber);
  note.className += " stem";
  if (id == 1 || id == 3 || id == 6 || id == 8 || id == 10) {
    note.className += " black";
  }
  if (id > 0 && id <= 4) {
    note.style.width = "8.63333%";
  } else if (id > 7 && id <= 11) {
    note.style.width = "8.03333%";
  }
  return note;
},
makeWhiteKeys(id, octaveNumber){
  var note = this.makeKey(id, octaveNumber);
  note.classList.add("bottom");
  return note;
},
makeOctave(octaveNumber = 4){
  // wraps one octave of keys and style it...
  var octave = createElement("div", {className: "octave"});
  octave.style.width = this.octavePercent + "%";
  for (var i = 0; i < 12; i++) {
    var note = this.makeStems(i, octaveNumber);
    octave.append(note);
  }
  for (var i = 0; i < 7; i++) {
    var ids = [0, 2, 4, 5, 7, 9, 11];
    var note = this.makeWhiteKeys(ids[i], octaveNumber);
    octave.append(note);
  }
  return octave;
},

makePatchWindow(keyboard){
  const topPanel = keyboard.getElementsByClassName("topPanel")[0];
  const dragHandle = keyboard.getElementsByClassName("handle")[0];
  const patchSelector = createElement("div", { className: "patchList" });
  patchSelector.addEventListener("mousedown", patchListener, true);
  topPanel.insertBefore(patchSelector, dragHandle);
},

calculateRange(octaves, octaveStart){
  this.octaves=octaves;
  this.octaveStart = octaveStart>=0 && octaveStart<9 ? 
  octaveStart : 5 - Math.round(octaves / 2);
  this.notePercent = 100 / (octaves * 7 + 1);
  this.octavePercent = this.notePercent * 7;
  this.octaveEnd = this.octaveStart + this.octaves;
},

makeUpperC(){
  var topKey = this.makeKey(0, this.octaveEnd);
  topKey.style.width = this.notePercent + "%";
  topKey.style.height = "100%";
  topKey.classList.add("bottom");
  return topKey;
},
makeInterface(octaves, octaveStart){
  const keyboard = createElement("div", { className: "keyboard" });
    // make size and range calculations
  this.calculateRange(octaves, octaveStart);
    // add octaves...
  for (var count = this.octaveStart; count < this.octaveEnd; count++) {
    var octave = this.makeOctave( count);
    keyboard.appendChild(octave);
  }
    // and add the top note (upper 'C');
  keyboard.appendChild(this.makeUpperC());  

    // add the patch window
    //makePatchWindow(keyboard);

  document.body.appendChild(keyboard);
    // add computerkeyboard listener.
    addTypeListener(keyboard);
    return keyboard;
},

makeKeyboard(octaves = 2, octaveStart){
  const keyboard = makeAudioComponent(component="keyboard" );
  console.log(keyboard)
  keyboard.interface = Module.makeInterface(octaves, octaveStart);
  const wrapper=draggableComponentWrapper(keyboard.interface, keyboard);
  document.body.appendChild(wrapper);
  return wrapper;
}

};

function addTypeListener(element, octave = 4) {
  var keys = "awsedftgyhujkol";

  document.body.addEventListener(
    "keydown",
    function(event) {
      var currentOctave = octave;

      var note = keys.indexOf(event.key);
      if (note > 11) {
        currentOctave++;
        note = note - 12;
      }
      if (note > -1) {
        var el = document.querySelector(
          "div." + notes.sharpScale[note] + currentOctave
        );
        keyPressed(el);
      }
    },
    false
  );
  document.body.addEventListener(
    "keyup",
    function(event) {
      var currentOctave = octave;
      var note = keys.indexOf(event.key);
      if (note > 11) {
        currentOctave++;
        note = note - 12;
      }
      if (note > -1) {
        var el = document.querySelector(
          "div." + notes.sharpScale[note] + currentOctave
        );
        noteReleased(el);
      }
    },
    false
  );
}

