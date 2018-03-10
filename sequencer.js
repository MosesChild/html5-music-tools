const sequencerWrapper = document.createElement("div");
sequencerWrapper.id = "sequencer";
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
};

function latchNote(e) { // function assigns next keyboard note to be played by 'division'.
    if (e.target.className.length===2){  //quick hack to exempt not note events!
    this.dataset.trigger=e.target.className;
    console.log("e.target",e.target,"this",this);
    }
}
const sequencer = {
  init() {
    for (let i = 0; i < this.timeValue; i++) {
      let division = document.createElement("div");
      division.id = "division" + i;
      division.className = "division";
      division.dataset.on = "false";
      division.onclick = () => {
        division.dataset.on =
          division.dataset.on === "false" ? "true" : "false";
          if (division.dataset.on==="false"){
              delete division.dataset.trigger;
          }
      };
      sequencerWrapper.appendChild(division);
    }
    sequencer.seqNotes = document.getElementsByClassName("division");
  },
  seqNotes: null,
  quarterPulse: quarterPulse,
  division: 0,
  timeValue: 16, // 8th notes=8, 16th notes = 16...
  measure: 4,
  bpm: 120,
  quarter: null,
  get divisionTime() {
    this.quarter = this.timeValue / this.measure;
    return 60 / this.bpm / this.quarter;
  },
  play: null,
  start() {
    console.log("startSequencer", sequencer.divisionTime);
    if (!sequencer.play) {
      sequencer.play = setInterval(() => {
        // turn off last value...
        let lastDivision = document.getElementById(
          "division" + sequencer.division
        );
        //   console.log(sequencer.divisionTime, lastDivision);
        lastDivision.classList.remove("on");

        // make click...
        if (sequencer.division % sequencer.quarter === 0) {
          sequencer.quarterPulse.classList.add("on");
        } else {
          sequencer.quarterPulse.classList.remove("on");
        }

        sequencer.division = (sequencer.division + 1) % sequencer.timeValue;
        // trigger sound...
        const currentElement = sequencer.seqNotes[sequencer.division];
        if (currentElement.dataset.on == "true") {
          if (currentElement.dataset.trigger) {
            document.removeEventListener("click", boundLatchNote, false);
            console.log(currentElement);
            playNote(currentElement.dataset.trigger);
          } else {
            boundLatchNote = latchNote.bind(currentElement);
            document.addEventListener("click", boundLatchNote, false);
          } 
        }

        document.getElementById("division" + sequencer.division)
          .classList.add("on");
      }, sequencer.divisionTime * 1000);
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
