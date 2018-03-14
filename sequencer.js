$ = selector => {
  const nodeList = document.querySelectorAll(selector);
  if (nodeList.length === 1) {
    return nodeList[0];
  } else {
    return nodeList;
  }
};

const sequencer = {
  createInstance() {
    const sequencerWrapper = document.createElement("div");
    sequencerWrapper.className = "sequencer";
    document.body.appendChild(sequencerWrapper);

    const bpm = document.createElement("input");
    bpm.type = "text";
    bpm.value = 120;

    for (let i = 0; i < this.timeValue; i++) {
      let step = document.createElement("div");
      step.id = "step" + i;
      step.className = "step";
      step.onclick = clickSeqStep;
      sequencerWrapper.appendChild(step);
    }  
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

    const click = document.createElement("div");
    click.id = "click";

    const panel = document.createElement("div");
    panel.appendChild(start);
    panel.appendChild(stop);
    panel.appendChild(bpm);
    panel.appendChild(click);
    document.body.appendChild(panel);

    this.click=click;
    this.steps = document.getElementsByClassName("step");
  },
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
        const oldCursor = document.querySelectorAll(".now");
        const lastStep = document.getElementById("step" + sequencer.step);
        const currentStep = sequencer.steps[sequencer.step];

        // turn off last cursor value (now)...
        if (oldCursor) {
          oldCursor.forEach(cursor => cursor.classList.remove("now"));
        }
        // release last notes...
        $(".pressed").forEach(key => key.classList.toggle("pressed"));
        // increment step..
        sequencer.step = (sequencer.step + 1) % sequencer.timeValue;
        document.getElementById("step" + sequencer.step).classList.add("now");

        // make metronome click...
        if (sequencer.step % sequencer.quarter === 0) {
          sequencer.click.classList.add("now");
        } else {
          sequencer.click.classList.remove("now");
        }
        // if step is 'on'... trigger current notes...
        if (currentStep.dataset.triggerList) {
          triggerNotes(currentStep);
        }
      }, sequencer.stepTime * 1000);
    }
  }
};

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

function triggerNotes(seqStep) {
  console.log("triggerNotes", seqStep);
  useTriggerList(seqStep, playNote);
  useTriggerList(seqStep, notePressed);
}

function handleTriggerList(note, listNotes) {
  var notes = listNotes ? listNotes.trim() : "";
  const splitPoint = notes.indexOf(note);
  if (splitPoint > -1) {
    return notes.slice(0, splitPoint) + notes.slice(splitPoint + note.length);
  } else return (notes = note + " " + notes);
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

function latchNote(e) {
  // function assigns next keyboard note to currently 'active' seqStep.dataset.triggerList .
  const isKey = e.target.classList.contains("key");
  const activeKey = e.target.classList.contains("active");
  const seqStep = this;
  console.log(e.target.dataset.midinote);
  if (isKey) {
    const key = e.target.dataset.midinote;
    toggleKeyActive(key);
    //  console.log("e.target", e.target.dataset, "seqStep", seqStep.dataset);
    const newList = handleTriggerList(key, seqStep.dataset.triggerList);

    if (newList.length === 0) {
      delete seqStep.dataset.triggerList;
    } else {
      seqStep.dataset.triggerList = newList;
    }
    console.log("latchNote", seqStep.dataset.triggerList);
  }
}

function clickSeqStep(e) {
  /* when the seqStep element is clicked, behaviour :
  adds class active (and removes previously active);
  - if currentStep is off : on,
  - if previousStep exists : deActivate listener/stop showing keys
      if previousStep triggers no notes: turn previousStep Off
  - currentStep : activate (listener + ) 

 'boundLatchNote' listener adds keyboard strikes to 
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
    keys.removeEventListener("click", boundLatchNote, false);
    if (!lastStep.dataset.triggerList) {
      lastStep.classList.remove("on");
    }
  }
  if (newActiveStep) {
    boundLatchNote = latchNote.bind(seqStep);
    keys.addEventListener("click", boundLatchNote, false);
  } else {
    keys.removeEventListener("click", boundLatchNote, false);
  }
  seqStep.classList.toggle("active");
  updateActiveKeys(seqStep);
  console.log("makeActive", seqStep);
}

sequencer.createInstance();
