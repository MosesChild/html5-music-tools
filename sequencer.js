const sequencerWrapper = document.createElement("div");
sequencerWrapper.className = "sequencer";
document.body.appendChild(sequencerWrapper);

const quarterPulse = document.createElement("div");
quarterPulse.id = "quarterPulse";

function eventFire(el, etype) {
  if (el.fireEvent) {
    el.fireEvent("on" + etype);
  } else {
    var evObj = document.createEvent("Events");
    evObj.initEvent(etype, true, false);
    el.dispatchEvent(evObj);
  }
}

function triggerNotes(triggerList) {
  var notes = triggerList!=undefined ? 
  triggerList.trim().split(" ") : [] ;
  console.log("triggerNotes",notes)
  notes.forEach(note=>{
    let playThis=document.querySelector(`.key[data-midinote=${note}]`);
    console.log(playThis);
    playNote(playThis);

  });
}
function handleTriggerList(note, listNotes) {
  var notes= listNotes? listNotes : "";
  const splitPoint = notes.indexOf(`${note} `);
    if (splitPoint>-1){
      return listNotes.slice(0,splitPoint)+listNotes.slice(splitPoint+note.length);
  } else return (notes += `${note} `);
}
function latchNote(e) {
  // function assigns next keyboard note to be played by 'step'.
  if (e.target.classList.contains("key")) {

    const midinote = e.target.dataset.midinote;
  //  console.log("e.target", e.target.dataset, "this", this.dataset);
    const newList = handleTriggerList(
      midinote,
      this.dataset.triggerList
    );
    if (newList.length===0){
      delete this.dataset.triggerList;
    } else {
      this.dataset.triggerList=newList;
    }
    console.log("latchNote", this.dataset.triggerList);
  }
}
// when the sequencer step 'step' is clicked on,
// it becomes active (and removes active from last element);
// this latches keyboard hits to current step until clicked again or different step is selected.
// It also toggles 'trigger/on off

function makeActive(el) {
  const previouslyActive = el.classList.contains("active");
  const deactivate = el.closest(".sequencer").getElementsByClassName("active");
  for (all of deactivate) {
    all.classList.remove("active");
    document.removeEventListener("click", boundLatchNote, false);
  }
  if (!previouslyActive) {
    el.classList.add("active");
    boundLatchNote = latchNote.bind(el);
    document.addEventListener("click", boundLatchNote, false);
  }
  console.log("makeActive", el);
}

function clickSeqStep(el) {
  const currentStep = el.target.dataset;
  if (currentStep.on==="false"){
    makeActive(el.target);
  }
  currentStep.on = currentStep.on === "false" ? "true" : "false";

}

const sequencer = {
  init() {
    for (let i = 0; i < this.timeValue; i++) {
      let step = document.createElement("div");
      step.id = "step" + i;
      step.className = "step";
      step.dataset.on = "false";
      step.onclick = clickSeqStep;
      sequencerWrapper.appendChild(step);
    }
    sequencer.seqNotes = document.getElementsByClassName("step");
  },
  seqNotes: null,
  quarterPulse: quarterPulse,
  step: 0,
  timeValue: 16, // 8th notes=8, 16th notes = 16...
  measure: 4,
  bpm: 120,
  quarter: null,
  get stepTime() {
    this.quarter = this.timeValue / this.measure;
    return 60 / this.bpm / this.quarter;
  },
  play: null,
  start() {
    console.log("startSequencer", sequencer.stepTime);
    if (!sequencer.play) {
      sequencer.play = setInterval(() => {
        // turn off last value...
        let lastStep = document.getElementById("step" + sequencer.step);
        //   console.log(sequencer.stepTime, lastStep);
        lastStep.classList.remove("on");

        // make click...
        if (sequencer.step % sequencer.quarter === 0) {
          sequencer.quarterPulse.classList.add("on");
        } else {
          sequencer.quarterPulse.classList.remove("on");
        }

        sequencer.step = (sequencer.step + 1) % sequencer.timeValue;
        // trigger sound...
        const currentStep = sequencer.seqNotes[sequencer.step];

        if (currentStep.dataset.on == "true") {
          triggerNotes(currentStep.dataset.triggerList);
        }

        document.getElementById("step" + sequencer.step).classList.add("on");
      }, sequencer.stepTime * 1000);
    }
  }
};

sequencer.init();

const start = document.createElement("button");
start.id = "startSequencer";
start.type = "button";
start.innerHTML = '<i class="material-icons">play_arrow</i>';
start.onclick = sequencer.start;

const stop = document.createElement("button");
stop.id = "stopSequencer";
stop.type = "button";
stop.innerHTML = '<i class="material-icons" style="color:black">stop</i>';
stop.onclick = function() {
  console.log("stop");
  clearTimeout(sequencer.play);
  sequencer.play = null;
};

const bpm = document.createElement("input");
bpm.type = "text";
bpm.value = "120";

const panel = document.createElement("div");
panel.appendChild(start);
panel.appendChild(stop);
panel.appendChild(bpm);
panel.appendChild(quarterPulse);
document.body.appendChild(panel);
