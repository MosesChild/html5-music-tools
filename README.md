# html5-music-tools

Sampler, Keyboard, Synths, Midi, Controllers, and user-friendly environment for HTML-5 audio SFX and music-making.

This repository contains a few music/sfx utilities created as modules to be used independently or together.
It is a set of modern retakes on music samplers, synthesizers and step-sequencers for hobbyist disection and amusement!

Currently at beta stage...  would love any comments, feedback, feature-requests, bug reports and collaboration!

 File                  | Description
----------------------|---------------------------------
keyboard.js         | creates a piano keyboard complete with event listeners.
sampler.js          | record audio from microphone and playback with keyboard module.
sequencer.js| creates an easy edit 'step-sequencer' in HTML that can play the keyboard/sampler.
index.html | the current setup that uses all three modules.

## Get Started

### HTML & CSS

in the ```<head>``` section...

Add appropriate scripts and links... 
heres all of them...

```html
<script type="text/javascript" src="./keyboard.js"></script>
<script type="text/javascript" src="./sampler.js"></script>
<script type="text/javascript" src="./sequencer.js"></script>

<script type="text/javascript" src="./myScript.js"></script>

<link href="./index.css" rel="stylesheet">
<link href="./keyboard.css" rel="stylesheet">
```

*myscript.js is your own .js file!*

**Order of js files matter because of dependencies.**

## Modules

## keyboard.js

### makeKeyboard( octaves, domID, octaveStart )

### *arguments*

**octaves** - Number of octaves of piano keyboard to make.
    Default is 1;

**domID** - the ID of a css-sized 'div' to place the keyboard in.  If none provided, it will place a keyboard the width of the screen in the body element.

**octaveStart** -(a numeric value 0-8) Where the keyboard notes will trigger a sound module. Defaults to placing in the center of the range (at octave 4 if only 1 octave.)

*simplest example...*

```javascript
const keyboard=makeKeyboard();

```

creates a 2 octave keyboard (at octave 4) at the end of current html body content.

*advanced example...*

```javascript

const keyboard=makeKeyboard( 4, "myKeyboardWrapper", 1 );

```

Would create a 4 octave keyboard inside a div element with the id "myKeyboardWrapper" whose range starts at octave 1 :

**Important** - make sure you specify a width and height in units (**not %**) for the "keyboardWrapper" div (in html or css) or the created keyboard will be on the page but have no dimensions...:frowning:
