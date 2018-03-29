const makeSteps = ( stepCount, startNumber = 0 ) => {
  for (let i = startNumber; i < stepCount; i++) {
    let step = createElement("div", {
      id: "step" + i,
      className: "step",
      onclick: clickSeqStep
    });
    $(".sequencer").appendChild(step);
  }
};
const initializeStepsContainer=(stepCount) => {
  const sequencer = document.body.appendChild(createElement("div", { className: "sequencer" }));
  makeSteps(stepCount);
  return
}
const makeSeqPanel =( bpm, timeSigTop, timeSigBottom, ButtonEventHandler1, ButtonEventHandler2 )=> {
  const seqButtons = [["togglePlay", "play_arrow", ButtonEventHandler1]];//["back","skip_previous",ButtonEventHandler2],
  const panel = createPanel(seqButtons,"seqPanel");
  panel.appendChild(createElement("input", { type: "number", id: "bpm", className: "panel-element", value: bpm }));
  const wrapper =panel.appendChild(createElement("div", {className:"timeSigWrapper panel-element"}))
  wrapper.appendChild(createElement("input", { type: "number", id: "timeTop", value: timeSigTop }))
  wrapper.appendChild(createElement("input", { type: "number", id: "timeBottom", value: timeSigBottom }))
  panel.appendChild(createElement("div", { id: "panelClick", className: "panel-element"}));
  return panel;
};


const makeSequencer = ({
  instanceName = defaultInstance("sequencer"),
  bpm = 120,
  timeSigTop = 4,
  timeSigBottom = 4,
  stepsPerTop = 4,
  measures = 2
} = {}) => ({
  instanceName,
  bpm,
  timeSigTop,
  timeSigBottom,
  stepsPerTop,
  measures,
  sequencerWindow: initializeStepsContainer(stepsPerTop * timeSigTop * measures),
  panel: document.body.appendChild(makeSeqPanel(bpm,timeSigTop,timeSigBottom, this.togglePlay)),
  steps: document.getElementsByClassName("step"),
  startButton: document.getElementById("togglePlay"),
  bpmInput: document.getElementById("bpm"),
  panelClick: document.getElementById("panelClick"),
  step: 0,
  metronome: timeSigTop,
  playTimer: null,
  stepTime: 60 / bpm / (stepsPerTop ),
  init() { 
    document.getElementById("togglePlay").firstChild.classList.add("large");
    // currently necessary to get default bindings...
    this.startButton.onclick = this.togglePlay.bind(this);
    this.bpmInput.onchange = this.changeBPM.bind(this);
  },
  togglePlay(e){
    let icon=$("#togglePlay").firstChild;
    if (this.playTimer){
      this.stop();
      console.log(icon);
      icon.textContent="play_arrow";
    } else {
      icon.textContent="pause";
      this.start();
    }
  },
  stop(){ clearInterval(this.playTimer);
      this.playTimer = null;
  },
  handleTimeChanges(e){
    const inputID=event.target.ID;
      this[inputID]=event.target.value;
      if (inputID==="timeSigBottom" || inputID==="timeSigTop"){
        // change steps!
        // calculate new steps 
        const newStepNumber=stepsPerTop * timeSigTop * measures;
        if (newStepNumber>this.steps){
          this.sequencerWindow.append
        }
        
        
      }
      changeBPM(e);    
  },
  changeBPM(e) {//handleTimeChange
    const elapsedTime = new Date() - this.lastBeat;
    const nextBeat =
      this.stepTime - elapsedTime > 0 ? this.stepTime - elapsedTime : null;
    this.bpm = e.target.value;
    this.setTimeParameters();
    if (this.playTimer) {
      clearInterval(this.playTimer);
      this.playTimer = null;
      if (nextBeat) {
        setTimeout(this.start, nextBeat);
      }
      this.start();
    }
  },
  setTimeParameters() {
    this.stepTime = 60 / this.bpm / (stepsPerTop );
  },
  start() {
    console.log("startSequencer", this.stepTime);
    if (!this.playTimer) {
      const totalSteps=stepsPerTop * timeSigTop * measures;
      this.playTimer = setInterval(() => {
        const oldCursor = document.querySelectorAll(".now");
     //   const lastStep = document.getElementById("step" + this.step);
        let currentStep = this.steps[this.step];
        // turn off last cursor value (now)...
        if (oldCursor) {
          oldCursor.forEach(cursor => cursor.classList.remove("now"));
        }
        // release last notes...
        $(".pressed").forEach(key => key.classList.remove("pressed"));

        // increment step..
        this.step = (this.step + 1 ) % totalSteps;
        // make metronome click...
        if (this.step % this.metronome===0 ) {
          this.panelClick.classList.add("now");
        } else {
          this.panelClick.classList.remove("now");
        }
        document.getElementById("step" + this.step).classList.add("now");
        // if step is 'on'... trigger current notes...
        if (currentStep.classList.contains("on") && currentStep.dataset.triggerList) {
          triggerNotes(currentStep);
        }
        // record time (for smooth bpm)
        this.lastBeat = new Date();
      }, this.stepTime * 1000);
    }
  }
});

function useTriggerList(seqStep, triggerCallback) {
  console.log("useTriggerList", seqStep);
  const triggers = seqStep.dataset.triggerList
    ? seqStep.dataset.triggerList.trim().split(" ")
    : [];

  triggers.forEach(triggerName => {
    const trigger = triggerName.includes("sample") ? $(`#${triggerName}`) :
    document.querySelector(`div[data-midinote=${triggerName}]`);
    triggerCallback(trigger);
  });
}

function addRemoveTriggerList(triggerName, listNotes) {
  var triggers = listNotes ? listNotes.trim() : "";
  const splitPoint = triggers.indexOf(triggerName);
  if (splitPoint > -1) {
    return triggers.slice(0, splitPoint) + triggers.slice(splitPoint + triggerName.length);
  } else return (triggers = triggerName + " " + triggers);
}

function triggerNotes(seqStep) {
  console.log("triggerNotes", seqStep);
  useTriggerList(seqStep, keyPressed);
  useTriggerList(seqStep, playNote);
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
  useTriggerList(seqStep, activateKey);
  console.log("updateActiveKeys");
}

function addElementToActiveStepTriggerList(e) {
  // function assigns next keyboard note to currently 'active' seqStep.dataset.triggerList .
  const isKey = e.target.classList.contains("key");
  const isSample = e.target.classList.contains("sample")
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
    console.log("addElementToActiveStepTriggerList", seqStep.dataset.triggerList);
  }
}

function clickSeqStep(e) {
  /*sequencer Step (currentStep) click behaviour pseudo-code:
if currentStep inactive
	if old step,
		make old step inactive
	make currentStep active
	if currentStep off make currentStep On
else if on make current off
else make current inactive
 'boundaddElementToActiveStepTriggerList' listener adds keys to 
 currentStep.dataset.triggerList'.*/
  const currentStep = e.target;
  const keys = document.getElementsByClassName("keyboard")[0];
  const currentStepActive = currentStep.classList.contains("active");
  const currentStepOff = !currentStep.classList.contains("on");
  const oldStep = currentStep.parentNode.querySelector(".active");
  const newStep = currentStep !== oldStep;
  console.log("oldStep", oldStep);

  if (newStep && !currentStepActive) {
    if (oldStep) {
      oldStep.classList.remove("active");
      //old step stop responding to key presses (add/remove )
      keys.removeEventListener("click", boundaddElementToActiveStepTriggerList, false);
      // stop showing old triggerlist
      if (!oldStep.dataset.triggerList) {
        oldStep.classList.remove("on");
      }
    }
    // activate current step...
    currentStep.className += " active";

    // add event listener...
    boundaddElementToActiveStepTriggerList = addElementToActiveStepTriggerList.bind(currentStep);
    keys.addEventListener("click", boundaddElementToActiveStepTriggerList, false);
    // if current step currently off (+ inactive) 
    if (currentStepOff) {
      currentStep.className += " on";
    }
    // otherwise (there was previously an active step) remove 'on'
  } else if (!currentStepOff) {
    currentStep.classList.remove("on");
  } else {  
    currentStep.classList.remove("active");
    
    keys.removeEventListener("click", boundaddElementToActiveStepTriggerList, false);
  }
  updateActiveKeys(currentStep);
  console.log("makeActive", currentStep);
}
