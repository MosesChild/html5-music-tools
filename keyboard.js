
const size=1;
var octave=5;
var octaveStart;
var freqTable;

var notes={ sharpScale: ["C","Csharp", "D","Dsharp","E","F","Fsharp","G","Gsharp","A","Asharp","B","C"],
              flatScale: ["C","Db", "D","Eb","E","F","Gb","G","Ab","A","Bb","B","C"]};

const nthroot = function(x,n) {
   //if x is negative function returns NaN
   return Math.exp((1/n)*Math.log(x));
}


const selectWholeKey = midinote => document.querySelectorAll(`.key[data-midinote=${midinote}]`);

const makeFreqTable = (cents)=>{// ready for tuning!
   var prevValue=27.5;
   var root2=nthroot(2,12);
   var cent=nthroot(2,1200);
   var table=[];
   if (cents){
      for (var c=0; c<cents; c++){
         prevValue=cent*prevValue;
      }
   }  
   for (let i=0; i<96; i++){     
      table.push(prevValue);    
      prevValue=prevValue*root2
   };
   return table;
}

function mousePressed(event){
   if (event.buttons & 1) {
      keyPressed(event.target);
   }
}
function mouseReleased(event) {
   noteReleased(event.target)
}

function keyPressed(target) {
   selectWholeKey ( target.dataset.midinote )
   .forEach(part=>part.className+=" pressed");
   playNote(target);
}

function noteReleased(target) {
      selectWholeKey ( target.dataset.midinote )
      .forEach(part=>
            part.classList.remove("pressed")); 
}

var makeKey=function(id,octaveNumber){
   var key=document.createElement('div');
   key.className="key";
   key.dataset.midinote=notes.sharpScale[id]+""+octaveNumber;
   key.dataset.id=id;
   key.dataset.octave=octaveNumber;
   key.dataset.frequency = freqTable[(octaveNumber*12+id)];

   key.addEventListener("mousedown", mousePressed, false);
   key.addEventListener("mouseup", mouseReleased, false);
   key.addEventListener("mouseover", mousePressed, false);
   key.addEventListener("mouseleave", mouseReleased, false);
   return key;
}

var makeStems=function(id, octaveNumber){
      var note=makeKey(id,octaveNumber);
      note.className+=" stem";
   if (id==1 || id==3 || id==6 || id==8 || id==10) {
         note.className+=" black";
      }
      if (id>0 && id<=4){
         note.style.width="8.63%"
      } else if (id>7 && id<=11){
         note.style.width="8.03%";
      }
   return note;
}
var makeWhiteKeys = function(id,octaveNumber){
   var note=makeKey(id,octaveNumber);
   return note;
}

function makeOctave(width, octaveNumber=4){
   // wraps one octave of keys and style it...
   var octave=document.createElement('div');
   octave.className="octave";
   octave.style.width=width;
   for (var i=0; i<12; i++){
      var note=makeStems(i, octaveNumber);
      octave.append(note);
   }
   for (var i=0; i<7; i++){
      var ids=[0,2,4,5,7,9,11];
      var note=makeWhiteKeys(ids[i], octaveNumber);
     octave.append(note);
   }
   return octave;
}


var makeKeyboard=function(octaves=2, domID, octaveStart){
   freqTable=makeFreqTable();
   var w,octaveStart, octaveEnd, target;
   if (octaveStart==undefined){
      octaveStart=5-(Math.round(octaves/2))
   }
   octaveEnd=octaveStart+octaves;
   
   if (!domID){
      w = window.innerWidth;
      h = window.innerWidth
      var keyboardWrapper=document.createElement('div');

      keyboardWrapper.id="keyboardWrapper";
      document.body.append(keyboardWrapper);
      target=keyboardWrapper;
      console.log("making default keyboardWrapper");
   } else {
      target=document.getElementById(domID);
   }
   var notePercent=100/(octaves*7+1);
   var octavePercent=notePercent*7;
   
   // first setup keyboard div...
   var keyboard=document.createElement('div');
   keyboard.className='keyboard';

   // add octaves... 
   for (var count=octaveStart; count<octaveEnd; count++){
      var octave=makeOctave(octavePercent+'%',count);
      keyboard.append(octave);
   }       
   // and add the top note (upper 'C');
   var topKey=makeKey(0,octaveEnd);
   topKey.style.width=notePercent+"%";
   topKey.style.height="100%"

   keyboard.append(topKey); 
   
   // add eventlisteners
   addTypeListener(keyboard);
   target.appendChild(keyboard);
   return keyboard;// not strictly necessary...
}

function addTypeListener(element,octave=4){
   var keys="awsedftgyhujkol";
   
   document.body.addEventListener("keydown", function( event ) {
      var currentOctave=octave;
      
      var note=keys.indexOf(event.key)
      if (note>11){currentOctave++; note=note-12}
      if (note>-1){
         var el = document.querySelector("div."+notes.sharpScale[note]+currentOctave);
         keyPressed(el)
      }
   }, false);
   document.body.addEventListener("keyup", function( event ) {
      var currentOctave=octave;
      var note=keys.indexOf(event.key)
      if (note>11){currentOctave++; note=note-12}
      if (note>-1){
         var el = document.querySelector("div."+notes.sharpScale[note]+currentOctave);   
         noteReleased(el) 
      }
   }, false);
}
