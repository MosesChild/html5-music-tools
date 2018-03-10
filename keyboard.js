const size=1;
var octave=5;

var by=document.querySelector('body');

var notes={ sharpScale: ["C","Csharp", "D","Dsharp","E","F","Fsharp","G","Gsharp","A","Asharp","B","C"],
              flatScale: ["C","Db", "D","Eb","E","F","Gb","G","Ab","A","Bb","B","C"]};

const nthroot = function(x,n) {
   //if x is negative function returns NaN
   return Math.exp((1/n)*Math.log(x));
}

var makeFreqTable = function(cents){// ready for tuning!
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
function showKeyDown(className){
   var these=document.getElementsByClassName(className);   
   for (both of these){ both.style.background="#AAAAAA"}
}
function showKeyUp(className){
   var these=document.getElementsByClassName(className);
   for (both of these){ 
      let id=both.dataset.id;
      id==1 || id==3 || id==6 || id==8 || id==10 ? both.style.background="black" 
      : both.style.background="white"}   
}
function mousePressed(event){
   if (event.buttons & 1) {
      notePressed(event.target);
   }
}
function notePressed(target) {  
   let dataset=target.dataset
      if (!dataset["pressed"]) {
         dataset["pressed"] = "yes";
         showKeyDown(target.className);
         try {playNote(target);}
         catch(e){}
   }       
}
function mouseReleased(event) { 
   noteReleased(event.target)
}
function noteReleased(target) {
    
    let dataset = target.dataset;
 //  if (dataset && dataset["pressed"]) {
      try {releaseNote(target);}
      catch(e){}
      delete dataset["pressed"];     
   showKeyUp(target.className);
}

var makeNote=function(id,octaveNumber){
   var note=document.createElement('div');
   note.style.float = "left";
   note.style.boxShadow="inset -1px 0px black";
   note.classList.add(notes.sharpScale[id]+""+octaveNumber)
   note.dataset.id=id;
   note.dataset.octave=octaveNumber;
   note.dataset.frequency = freqTable[(octaveNumber*12+id)];

   note.addEventListener("mousedown", mousePressed, false);
   note.addEventListener("mouseup", mouseReleased, false);
   note.addEventListener("mouseover", mousePressed, false);
   note.addEventListener("mouseleave", mouseReleased, false);
   return note;
}

var makeStems=function(id, octaveNumber){
      var note=makeNote(id,octaveNumber);
      note.style.background = "white";
      note.style.width="8.33%";
      note.style.height="60%";
   if (id==1 || id==3 || id==6 || id==8 || id==10) {
         note.style.background="black";
      } 
      if (id>0 && id<=4){
         note.style.width="8.63%"
      } else if (id>7 && id<=11){
         note.style.width="8.03%";
      }
   return note;
}
var makeWhiteKeys = function(id,octaveNumber){
   var note=makeNote(id,octaveNumber);
   note.style.background="white";
   note.style.height="40%";
   note.style.width="14.2857%";
   return note;
}

function makeOctave(width, octaveNumber=4){
   // make a container to hold all keys and style it...
   var octave=document.createElement('div');
   octave.className="octave";
   octave.style.width=width;
   octave.style.float="left";
   octave.style.height="100%";
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
var octaveStart;
var freqTable;

var makeKeyboard=function(octaves, domID, octaveStart){
   freqTable=makeFreqTable();
   var w,octaveStart, octaveEnd, target;
   if (octaveStart==undefined){
      octaveStart=5-(Math.round(octaves/2))
   }
   octaveEnd=octaveStart+octaves;
   
   if (domID==undefined){
      w = window.innerWidth;
      var container=document.createElement('div');
      container.style.width=w+"px";
      container.style.height="10em";
      container.id="container";
      //document.body.append(container);
      target=container;
   } else {
      target=document.getElementById(domID);
   //   w = target.offsetWidth;
   }
   var notePercent=100/(octaves*7+1);
   var octavePercent=notePercent*7;
   
   // first setup keyboard div...
   var keyboard=document.createElement('div');
   keyboard.className='keyboard';
   keyboard.style.width="100%";
   keyboard.style.height="100%";
   keyboard.style.borderBottom="1px solid black";
   keyboard.style.borderLeft="1px solid black";
 
   // add octaves... 
   for (var count=octaveStart; count<octaveEnd; count++){
      var octave=makeOctave(octavePercent+'%',count);
      keyboard.append(octave);
   }       
   // and add the top note (upper 'C');
   var topNote=makeNote(0,octaveEnd);
   topNote.style.width=notePercent+"%";
   topNote.style.height="100%";
   topNote.style.background="white";
   keyboard.append(topNote); 
   
   // add eventlisteners
   addTypeListener(keyboard);

   return keyboard;
}


function addTypeListener(element,octave=4){
   var keys="awsedftgyhujkol";
   
   document.body.addEventListener("keydown", function( event ) {
      var currentOctave=octave;
      
      var note=keys.indexOf(event.key)
      if (note>11){currentOctave++; note=note-12}
      if (note>-1){
         var el = document.querySelector("div."+notes.sharpScale[note]+currentOctave);
         notePressed(el)
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
