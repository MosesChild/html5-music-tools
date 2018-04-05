
const audioNodeGainSettings = {
    amount: { value: 1, min: 0, max: 1, step: 0.01 },
    delay: {value: 0, min: 0, max: 5, step: 'any'},
    attack: { value: 0.01, min: 0, max: 5, step: 0.01 },
    decay: { value: 0.2, min: 0, max: 5, step: 0.01 },
    sustain: { value: 0.8, min: 0, max: 1, step: 0.01 },
    release: { value: 0.5, min: 0, max: 5, step: 0.05 }
  };

  function envelope (destination, value, delay, attackDuration, decayDuration, sustain){
    var time=audioContext.currentTime;
    console.log(destination, time, attackDuration);
    // destination.setValueAtTime(0, time);
     destination.cancelScheduledValues(time+delay);
     destination.linearRampToValueAtTime(value, (time + delay + attackDuration));
     destination.linearRampToValueAtTime(0,time+delay);
     destination.linearRampToValueAtTime(value * sustain, (time + delay + attackDuration + decayDuration));
 }
 
 function envelopeRelease (destination,  releaseTime) {
     console.log("envelopeRelease", destination.value, releaseTime);
    var time=audioContext.currentTime;
    destination.cancelScheduledValues(time);
    destination.setValueAtTime(destination.value,time);
    destination.linearRampToValueAtTime(0, (time + releaseTime));
 }

function makeTrigger(destination){
    const triggerPad=createElement('div',{className:'trigger'});
    const trigger={
        triggerPad: triggerPad,
        destination: destination,
        mousePressed(event) {
            if (event.buttons & 1) {
                triggerPad.classList.add("hit");  
                console.log(Environment, destination)
                Environment[destination].trigger();
            }
        },
        mouseReleased(event) {
            triggerPad.classList.remove("hit");
            console.log(this.destination)
            Environment[destination].triggerRelease();
        },       
        setDestination(destination){
            this.destination=destination
        },        
    }
    triggerPad.addEventListener("mousedown", trigger.mousePressed, false);
    triggerPad.addEventListener("mouseup", trigger.mouseReleased, false);
    triggerPad.addEventListener("mouseover", trigger.mousePressed, false);
    triggerPad.addEventListener("mouseleave", trigger.mouseReleased, false);
    return trigger;
}


function makeADSRinterface(){
    const adsr = faderGroup("ADSR","Amount", "Delay", "Att",  "Dec", "Sus", "Rel");
    groupLabel(adsr,"ADSR");
    document.body.appendChild(adsr);
    setFaderGroup(adsr, audioNodeGainSettings);
    return adsr;
}

const ADSRcontrols=(adsr)=> ({
    amount(e){adsr.adsrDisplay(); adsr.gain.gain.value = e},
    attack(e){adsr.adsrDisplay(); adsr.attack=e;},
    delay(e){adsr.adsrDisplay(); adsr.delay=e},
    decay(e){adsr.adsrDisplay(); adsr.decay=e;},
    sustain(e){adsr.adsrDisplay(); adsr.sustain=e;},
    release(e){adsr.adsrDisplay(); adsr.release=e;},
});
const makeADSR=() => ({
    gain: audioContext.createGain(),
    instance: defaultInstance("adsr"),
    display: createElement("canvas",{className: "adsr_display"}),
    amount: audioNodeGainSettings["amount"].value,
    delay: audioNodeGainSettings["delay"].value,
    attack: audioNodeGainSettings["attack"].value,
    decay: audioNodeGainSettings["decay"].value,
    sustain: audioNodeGainSettings["sustain"].value,
    release: audioNodeGainSettings["release"].value,
    interface: makeADSRinterface(),
    inputs: {"gain":this.gain},
    outputs: {"gain":this.gain, "connected":[]},

    init(){
        Environment[this.instance]=this;
        setOwner(this.interface, this.instance);
        const trigger=makeTrigger(this.instance); 
        this.interface.prepend(trigger.triggerPad);
        this.interface.prepend(this.display);
        this.interface=draggableComponentWrapper(this.interface,this.instance);
        this.controls=ADSRcontrols(this),
        
        document.body.appendChild(this.interface)
    },
    //initFaderGroup(){setFaderGroup(interface, audioNodeGainSettings)},
    disconnect(destination){
        // should show connections!
        disconnect(destination, this.instance)
    },
    connect(){
        // should show all destinations with checkboxes for connections!
        //const allDestinations;
        this.gain.connect(destination,this.instance);
    },
    adsrDisplay(){
        const time=[this.delay, this.attack, this.decay, this.release];
        const peak=0; zero=150;// to flip the y
        const sustain=150-this.sustain*150;
        const ctx= this.display.getContext("2d");
        var totalTime=time.reduce((accum,time)=>accum+time);
        var sustainLength=totalTime*0.2;
        const showSeconds=Math.floor(totalTime+sustainLength)+1;
        console.log(totalTime,sustainLength, showSeconds)

        time.splice(2, 0, sustainLength);

        // add 20% to display sustain...
        
        var unit=300/showSeconds;
        var unitTime=time.map(t=>t=t*unit);
        var delay=unitTime[0], attack=unitTime[1], decay=unitTime[2], 
            sustainLength=unitTime[3],release=unitTime[4];
        console.log(unitTime, totalTime);
        console.log(sustain)

        //flip coordinates by subtracting from height;
        // clear previous vals
        ctx.fillStyle = 'black';
        ctx.fillRect(0,0,300,150);

        // make ticks
        (()=>{            
            for (let tick=0; tick<showSeconds; tick++){ 
                ctx.beginPath();
                ctx.moveTo(unit*tick,145);
                ctx.lineTo(unit*tick,150);
                ctx.closePath()
                ctx.stroke();
                ctx.fillStyle= 'rgb(255,176,0)'
                ctx.fillText(tick+"s",unit*tick+3, 145)
                console.log("unit,tick",unit,tick)
        }
    })();
    ctx.strokeStyle ='rgb(255,176,0)';
        
        


        ctx.lineWidth = 2;
       // ctx.strokeStyle = "rgb(51, 255, 0)";      
        ctx.beginPath();
        ctx.moveTo(0,zero);
        ctx.lineTo(delay,zero)
        ctx.lineTo(delay+attack, peak);
        ctx.lineTo(delay+attack+decay, sustain);
        ctx.lineTo(delay+attack+decay+sustainLength, sustain)
        ctx.lineTo(delay+attack+decay+sustainLength+release, zero);
     //   ctx.closePath();
        ctx.stroke();
    },
    trigger(){
        envelope( this.gain.gain, this.amount, this.delay, this.attack, this.decay, this.sustain);
    },
    triggerRelease(){ envelopeRelease( this.gain.gain, this.release ) },
});


    

/*
const scope2=makeScope();
const adsr=makeADSR();
adsr.init();


const E=Environment;
const scope3=makeScope();

const LFO1=makeLFO();
LFO1.init();
LFO.osc.connect(adsr.gain);

*/






function iterateObject(obj,callback){
    let keys=Object.keys(obj);   
    keys.forEach(key=>{
        let child=obj[key];
        callback(child);
    });

};
function findNestedObjects(obj){
    iterateObject(obj,(par)=>{
        array.push(par);
        if (typeof par=="object"){
            console.log(par)
            findNestedObjects(par);
        }
    })
}
function findNestedAudioObjects(obj){
    const array=[];
    function findNested(obj){
        iterateObject(obj, par=>{
            if (par instanceof AudioNode){
                array.push(par);
                console.log(par, "HUH?")
                iterateObject(par,par=>console.log(par))
            } 
            if (par instanceof AudioParam){
                array.push(par);
                
            }
            if (typeof par==="object"){
                findNested(par);
            }
        });
    };
    findNested(obj);
    array.forEach(audioNode=>findNested)
    console.log(array);
    return array;
}

const listConnections=()=>{
    findNestedAudioObjects(Environment);
};

