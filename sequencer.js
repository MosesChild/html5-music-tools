const makeSteps = (stepCount) => {
  const sequencer=createElement('div',{className: "sequencer"});
  for (let i = 0; i < stepCount; i++) {
    let step = createElement("div", {id:"step"+i, className: "step", onclick: "clickSeqStep"});
    sequencer.appendChild(step);
  }
  return sequencer;
}
const makeSeqPanel = (bpm) => {
  const seqButtons = [["startSequencer",'play_arrow'],["stopSequencer","stop"]];
  const panel=createPanel(seqButtons);
  panel.appendChild(createElement("input",{type:"number", id: "bpm", value: bpm}));
  panel.appendChild(createElement("div",{id: "panelClick"}))
  return panel;
}

const makeSequencer = ({instanceName=defaultInstance("sequencer"), bpm = 120, timeSigTop = 4, timeSigBottom = 4, stepsPerMeasure = 16, clickTime = 8, measures = 2 } = {}) => ({
  instanceName,
  bpm,
  timeSigTop,
  timeSigBottom,
  stepsPerMeasure,
  clickTime,
  measures,
  sequencerWindow: document.body.appendChild(makeSteps(stepsPerMeasure*measures)),
  panel : document.body.appendChild(makeSeqPanel(bpm)),
  steps : document.getElementsByClassName("step"),
  startButton : document.getElementById("startSequencer"),
  stopButton : document.getElementById("stopSequencer"),
  bpmInput : document.getElementById("bpm"),
  panelClick : $("#panelClick"),
  step: 0,
  metronome: null,
  playTimer: null,
  stepTime: null,
  init() {
    this.stopButton.onclick = function() {
      clearInterval(this.playTimer);
      this.playTimer = null;
    }.bind(this);
    this.setTimeParameters();
    this.startButton.onclick = this.start.bind(this);
    this.bpmInput.onchange=this.changeBPM.bind(this);
  },
  changeBPM(e){
    const elapsedTime=new Date-this.lastBeat;
    const nextBeat = this.stepTime - elapsedTime > 0 ?
      this.stepTime - elapsedTime : null;
    this.bpm=e.target.value;
    this.setTimeParameters();
      if (this.playTimer){
        clearInterval(this.playTimer);
        this.playTimer=null;
        if (nextBeat){
          setTimeout(this.start, nextBeat);
        }
        this.start();
      } 
  },
  setTimeParameters(){
    this.stepTime = (60 / this.bpm) / (stepsPerMeasure/timeSigBottom);
  },
  start() {
    console.log("startSequencer", this.stepTime);
    if (!this.playTimer) {
      this.playTimer = setInterval(() => {
        const oldCursor = document.querySelectorAll(".now");
        const lastStep = document.getElementById("step" + this.step);
        const currentStep = this.steps[this.step];
        // turn off last cursor value (now)...
        if (oldCursor) {
          oldCursor.forEach(cursor => cursor.classList.remove("now"));
        }
        // release last notes...
        $(".pressed").forEach(key => key.classList.remove("pressed"));
        // increment step..
        this.step =  (this.step + 1) % (stepsPerMeasure*measures) ;
        document.getElementById("step" + this.step).classList.add("now");
  
        // make metronome click...
        if (this.step/this.measures === this.metronome) {
          this.panelClick.classList.add("now");
        } else {
          this.panelClick.classList.remove("now");
        }
        // if step is 'on'... trigger current notes...
        if (currentStep.dataset.triggerList) {
          triggerNotes(currentStep);
        }
        this.lastBeat=new Date();
      }, this.stepTime * 1000 );
    }
  }
});





function useTriggerList(seqStep, noteCallback) {
  console.log("useTriggerList", seqStep);
  const noteArray = seqStep.dataset.triggerList
    ? seqStep.dataset.triggerList.trim().split(" ")
    : [];

  noteArray.forEach(noteName => {
    const note = document.querySelector(`div[data-midinote=${noteName}]`);
    //  console.log("note", note);
    noteCallback(note);
  });
}

function addRemoveTriggerList(note, listNotes) {
  var notes = listNotes ? listNotes.trim() : "";
  const splitPoint = notes.indexOf(note);
  if (splitPoint > -1) {
    return notes.slice(0, splitPoint) + notes.slice(splitPoint + note.length);
  } else return (notes = note + " " + notes);
}

function triggerNotes(seqStep) {
  console.log("triggerNotes", seqStep);
  useTriggerList(seqStep, playNote);
  useTriggerList(seqStep, notePressed);
}

const deactivateKeys = () => {
  var activeKeys = $(".key.active");
  console.log("deactivateKeys", activeKeys);
  if (activeKeys) {
    for (let key of activeKeys) {
      key.classList.remove("active");
      console.log(key);
    }
  }
};

const toggleKeyActive = midinote => {
  selectWholeKey(midinote).forEach(key => key.classList.toggle("active"));
};

function updateActiveKeys(seqStep) {
  const activateKey = el => toggleKeyActive(el.dataset.midinote);
  const triggerList = seqStep.dataset.triggerList;
  deactivateKeys();
  //if (triggerList){  no longer needed because useTriggerList ignores empty triggerList.
  useTriggerList(seqStep, activateKey);
  //}
  console.log("updateActiveKeys");
}

function latchNoteToActiveStep(e) {
  // function assigns next keyboard note to currently 'active' seqStep.dataset.triggerList .
  const isKey = e.target.classList.contains("key");
  const activeKey = e.target.classList.contains("active");
  const seqStep = this;
  console.log(e.target.dataset.midinote);
  if (isKey) {
    const key = e.target.dataset.midinote;
    toggleKeyActive(key);
    //  console.log("e.target", e.target.dataset, "seqStep", seqStep.dataset);
    const newList = addRemoveTriggerList(key, seqStep.dataset.triggerList);

    if (newList.length === 0) {
      delete seqStep.dataset.triggerList;
    } else {
      seqStep.dataset.triggerList = newList;
    }
    console.log("latchNoteToActiveStep", seqStep.dataset.triggerList);
  }
}

function clickSeqStep(e) {
  /* when the seqStep element is clicked, behaviour :
  adds class active (and removes previously active);
  - if currentStep is off : on,
  - if previousStep exists : deActivate listener/stop showing keys
      if previousStep triggers no notes: turn previousStep Off
  - currentStep : activate (listener + ) 

 'boundlatchNoteToActiveStep' listener adds keys to 
 seqStep.dataset.triggerList'.*/
  const seqStep = e.target;
  const keys = document.getElementsByClassName("keyboard")[0];
  const currentStepActive = seqStep.classList.contains("active");
  const currentStepOff = !seqStep.classList.contains("on");
  const lastStep = seqStep.parentNode.querySelector(".active");
  const newActiveStep = seqStep !== lastStep;
  console.log("lastStep", lastStep);

  if (currentStepOff) {
    seqStep.className += " on";
  }
  if (lastStep) {
    lastStep.classList.remove("active");
    keys.removeEventListener("click", boundlatchNoteToActiveStep, false);
    if (!lastStep.dataset.triggerList) {
      lastStep.classList.remove("on");
    }
  }
  if (newActiveStep) {
    boundlatchNoteToActiveStep = latchNoteToActiveStep.bind(seqStep);
    keys.addEventListener("click", boundlatchNoteToActiveStep, false);
  } else {
    keys.removeEventListener("click", boundlatchNoteToActiveStep, false);
  }
  seqStep.classList.toggle("active");
  updateActiveKeys(seqStep);
  console.log("makeActive", seqStep);
}


