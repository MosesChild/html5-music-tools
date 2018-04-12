/* many thanks to Stuart Memo and his tutorial - 
https://code.tutsplus.com/tutorials/introduction-to-web-midi--cms-25220
without whom I may have spent hours trying to get midi to work!
*/
function startMidi(){
if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess()
        .then(success, failure);
}
 
function success (midi) {
    var inputs = midi.inputs.values();
    // inputs is an Iterator
 
    for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
        // each time there is a midi message call the onMIDIMessage function
        input.value.onmidimessage = onMIDIMessage;
    }
}
 
function failure () {
    console.error('No access to your midi devices.')
}
 
function onMIDIMessage (message) {
    if (message.data[0]!=191){
        console.log(message.data)
    
 
    if (message.data[0] === 159 && message.data[2] > 0) {
        var frequency = midiNoteToFrequency(message.data[1]);
        playNote(frequency);
      console.log(frequency);
    }
 
    if (message.data[0] === 143 || message.data[2] === 0) {
        releaseNote(frequency);
    }
}
}
 
function midiNoteToFrequency (note) {
    const conversion=Math.pow(2, ((note - 69) / 12)) * 440;
    console.log('frequency'+conversion);
    return conversion;

}
}
