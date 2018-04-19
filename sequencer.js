const makeSteps = ( stepsContainer, stepCount) => {
  var startNumber=stepsContainer.children.length;
  while (stepsContainer.children.length>stepCount){
    stepsContainer.removeChild(stepsContainer.lastChild);
  }
  if (startNumber<stepCount){
    for (let i = startNumber; i < stepCount; i++) {
      let step = createElement("div", {
        id: "step" + i,
        className: "step",
        onclick: clickSeqStep
      });
      stepsContainer.appendChild(step);
    }
  }
  return stepsContainer;
};

const makeMetronome=({downbeat=880, upbeat=440, length=0.1 }={})=>{
    const metronome={};//makeAudioComponent("metronome");
    const beep=audioContext.createOscillator();
    const gain=audioContext.createGain();
    var volume=.5
    const volumeControl= createElement("input", {className:
       "metronomeVolume", type:"range", min: 0, max: 1, step: .01});
    const volumeWrapper= createElement("span", {className: "metro_volume_wrapper"})
    const listener=(e)=>volume = e.target.value;
    volumeWrapper.appendChild(volumeControl);
   // volumeControl.style.width= "50px";
   Object.assign(volumeWrapper.style, {height: "40px", width: "20px"}) 
   Object.assign(volumeControl.style, {height: "20px",
      width: "40px",
      transformOrigin: "20px 20px",
      transform: "rotate(-90deg)"})
    beep.start();
    beep.connect(gain);
    gain.connect(audioContext.destination);
    gain.gain.value=0;

    onRangeChange(volumeControl, listener);

    Object.assign(metronome, {beep, gain, length})
    const beat = (beat)=>{
      if (beat==="down"){
        beep.frequency.setValueAtTime(downbeat, audioContext.currentTime);
      } else {
        beep.frequency.setValueAtTime(upbeat, audioContext.currentTime)
      }
      gain.gain.setValueAtTime(volume, audioContext.currentTime)
    // gain.gain.setValueAtTime(0, audioContext.currentTime+length);
      gain.gain.linearRampToValueAtTime(0, audioContext.currentTime+length)
    }
    return {beat, volumeWrapper}
}


const initializeStepsContainer=(stepCount) => {
  var stepsContainer = createElement("div", { className: "stepsContainer" });
  makeSteps(stepsContainer, stepCount, 0);
  return stepsContainer;
}

const makeTimeSig=(sequencer)=>{
  const sigTop=createElement("input", { type: "number", id: "timeTop", value: sequencer.timeSigTop})
  const sigBottom=createElement("input", { type: "number", id: "timeBottom", value: sequencer.timeSigBottom })
  const timeSig=wrapChildren(sigTop, sigBottom);
  timeSig.className = "timeSigWrapper panel-element";
  sigTop.onchange = sequencer.handleTimeChanges;
  sigBottom.onchange=sequencer.handleTimeChanges;
  return timeSig;
}


const makeSeqPanel =( sequencer )=> { 
  function togglePlay(e){
    console.log("HELLLO")
    let icon=playButton.firstChild;
    if (sequencer.playTimer){
      sequencer.stop();
      icon.textContent="play_arrow";
    } else {
      icon.textContent="pause";
      sequencer.start();
    }
  }
  const playButton=createMaterialIconButton("togglePlay","play_arrow",togglePlay);
  var bpmInput=createElement("input", { type: "number", id: "bpm", className: "panel-element", value: sequencer.bpm });
  const panelClick= createElement("div", { id: "panelClick", className: "panel-element"}); 
  const timeSig=makeTimeSig(sequencer);
  const panel=wrapChildren(playButton,bpmInput, timeSig, panelClick, sequencer.metro.volumeWrapper);
  
  playButton.firstChild.classList.add("large");
  //clickVolume.dataset={instance: "metronome0", component: "metronome", property:"volume"}

  Object.assign(panel, { className: "panel", id: "seqPanel" })

  document.body.appendChild(panel);
  return {
    panel,
    playButton,
    bpmInput,
    timeSig,
    panelClick
  }
};

const makeSequencer =({bpm = 120,
  timeSigTop = 4,
  timeSigBottom = 4,
  stepsPerTop = 4,
  measures = 2
  } = {}) =>{
    const sequencer=makeAudioComponent({component:"sequencer"});
    Object.assign(sequencer, {
      bpm,
      timeSigTop,
      timeSigBottom,
      stepsPerTop,
      measures,
      stepsContainer: initializeStepsContainer(stepsPerTop * timeSigTop * measures),
      changeBPM(e) {//handleTimeChange
        const elapsedTime = new Date() - this.lastBeat;
        const nextBeat =
          this.stepTime - elapsedTime > 0 ? this.stepTime - elapsedTime : null;
        this.stepTime = 60 / this.bpmInput.value / (stepsPerTop );
        if (this.playTimer) {
          clearInterval(this.playTimer);
          this.playTimer = null;
          if (nextBeat) {
            setTimeout(this.start, nextBeat);
          }
          this.start();
        }
      },
      handleTimeChanges(event){
        console.log(event)
        const inputID=event.target.id;
        var value=parseInt(event.target.value);
        var timeSigBottom=sequencer.timeSigBottom ;
          if (inputID==="timeBottom"){
            event.target.value = value>timeSigBottom ? 2 * timeSigBottom : 0.5 * timeSigBottom
            sequencer.timeSigBottom=event.target.value//value >=2 && value<= 64 ? value : sequencer.timeSigBottom;
            }
          if (inputID==="timeTop"){
            // change steps!
            sequencer.timeSigTop=timeTop=event.target.value
            // calculate new steps 
            const newStepNumber=stepsPerTop * timeTop * measures;
              makeSteps(sequencer.stepsContainer, newStepNumber)

          }
          sequencer.changeBPM();    
      },
      start() {
        console.log("startSequencer", this.stepTime);
        if (!this.playTimer) {
          const totalSteps=stepsPerTop * sequencer.timeSigTop * sequencer.measures;
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

            // make metronome click...
            if (this.step % this.metronome===0 ) {
              this.panelClick.classList.add("now");
              console.log(totalSteps/measures, this.step)
              let beat= this.step==0 || this.step==totalSteps/measures ? "down" : "beat"
              sequencer.metro.beat(beat)


            } else {
              this.panelClick.classList.remove("now");
            }
            document.getElementById("step" + this.step).classList.add("now");
            // if step is 'on'... trigger current notes...
            if (currentStep.classList.contains("on") && currentStep.dataset.triggerList) {
              triggerNotes(currentStep);
            }
                        // increment step..
                        this.step = (this.step + 1 ) % totalSteps;
            // record time (for smooth bpm)
            this.lastBeat = new Date();
            }, this.stepTime * 1000);
        }
      },
      metro: makeMetronome(),

    })
    
    Object.assign(sequencer, {
      window: draggableComponentWrapper(sequencer.stepsContainer, sequencer),
      panel: makeSeqPanel(sequencer),
      steps: document.getElementsByClassName("step"),
      bpmInput: document.getElementById("bpm"),
      panelClick: document.getElementById("panelClick"),
      step: 0,
      metronome: timeSigTop,
      playTimer: null,
      stepTime: 60 / bpm / (stepsPerTop ),
      stop(){ clearInterval(this.playTimer);
          this.playTimer = null;
      }
    });
    sequencer.bpmInput.onchange=sequencer.changeBPM;
    document.body.appendChild(sequencer.window);
}
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
  useTriggerList(seqStep, eventListeners.keyPressed);
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
