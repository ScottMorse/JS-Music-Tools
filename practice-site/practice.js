const allWhiteKeys = document.querySelectorAll('.white-key')
const allBlackKeys = document.querySelectorAll('.white-key')

const chromaticScale = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"]

function decideKey(){
    randRoot = chromaticScale[Math.round(Math.random() * (chromaticScale.length - 1))]
    return new Mode(randRoot,"major")
}

const key = decideKey()
console.log(key)
let keyInSharps = key.spelling.slice()
let keyInFlats = key.spelling.slice()

keyInSharps = keyInSharps.map(note => note.enharmonic("#"))
keyInFlats = keyInFlats.map(note => note.enharmonic("b"))

let passOct = false
let allPianoFlats = keyInFlats.map(note => {
    if(note.name[0] == "A" || note.name[0] == "B"){
        return note.name + "0"
    }
    else{
        return note.name + "1"
    }
}).sort((a,b)=> {
    if(a[0] == b[0]){
        if(b[1] == "b"){
            return 1
        }
        else{
            return -1
        }
    }
    else if(a > b){
        return 1
    }
    else{
        return -1
    }
})

let newArr = allPianoFlats.slice()
for(let i = 0; i < 6; i++){
    newArr = newArr.map(item => {
        if(item[item.length - 1] == String(i)){
            return item.replace(String(i),String(i + 1))
        }
        return item.replace(String(i + 1),String(i + 2))
    })
    allPianoFlats = allPianoFlats.concat(newArr)
}

if(allPianoFlats[0] == "Ab0"){
    allPianoFlats.shift()
}

allPianoSharps = allPianoFlats.slice().map(noteStr => {
    let newStr = noteStr
    if(noteStr[1] == "b"){
        if(noteStr[0] == "A"){
            newStr = "G#" + noteStr[2]
        }
        if(noteStr[0] == "B"){
            newStr = "A#" + noteStr[2]
        }
        if(noteStr[0] == "C"){
            newStr = "B" + String(parseInt(noteStr[2]) - 1)
        }
        if(noteStr[0] == "D"){
            newStr = "C#" + noteStr[2]
        }
        if(noteStr[0] == "E"){
            newStr = "D#" + noteStr[2]
        }
        if(noteStr[0] == "G"){
            newStr = "F#" + noteStr[2]
        }
    }
    return newStr
})

function blinkNote(noteName){
    const pianoKey = document.querySelector(`#${noteName}`)
    pianoKey.style.backgroundColor = "gold"
    pianoKey.style.boxShadow = "0px 0px 10px 1px gold"
    if(pianoKey.classList.contains("black-key")){
        setTimeout(()=>{
            pianoKey.style.backgroundColor = "black"
            pianoKey.style.boxShadow = "0px 0px 0px 0px gold"
        },500)
    }
    else{
        setTimeout(()=>{
            pianoKey.style.backgroundColor = "whitesmoke"
            pianoKey.style.boxShadow = "0px 0px 0px 0px gold"
        },500)
    }
}

function playNoteAudio(fileName){
    const noteAudio = new Audio(fileName)
    noteAudio.volume = 0.3
    noteAudio.play()
}

let piano = Synth.createInstrument('piano')
function playNote(sharpNoteName,octave,duration){
    //piano.play(sharpNoteName,octave,duration)
    const fileName = 'note-audio/' + (sharpNoteName + String(octave)).replace("#","s") + '.mp3'
    playNoteAudio(fileName)
    const backToFlat = new Note(sharpNoteName).enharmonic()
    blinkNote(backToFlat.name + String(octave))
}


//MAIN PLAYING FUNCTIONS START HERE

//1 2nd, 2 3rd, 3 4th, 4 5th, 5 6th, 6 7th, 7 octave
const oneOrNeg = [-1,1]
const intvls = [1,2]
const randToggle = [0,1]
function randMelNote(prevNote){
    const prevNoteIndex = allPianoSharps.indexOf(prevNote.name + String(prevNote.octave))
    let randDirection
    let randIntvl
    if(prevNote.name == keyInSharps[6].name){
        randDirection = 1
        randIntvl = 1
    }
    else{
        randIntvl = intvls[Math.round(Math.random() * 1)]
        if(prevNote.octave < 4){
            randDirection = 1
        }
        else if(prevNote.octave > 5){
            const steepUpHill = [-1,-1,-1,1]
            randDirection = steepUpHill[Math.round(Math.random() * 3)]
        }
        else{
            randDirection = oneOrNeg[Math.round(Math.random() * 1)]
        }
    }
    const newNoteStr = allPianoSharps[prevNoteIndex + randDirection * randIntvl]
    let octave = newNoteStr[newNoteStr.length - 1]
    const name = newNoteStr.replace(octave,"")
    octave = parseInt(octave)
    randNeighbor = randToggle[Math.round(Math.random() * 1)]
    if(randNeighbor){
        const neighbor = allPianoSharps[prevNoteIndex + randDirection * randIntvl + oneOrNeg[Math.round(Math.random() * 1)]]
        let neighborOctave = neighbor[neighbor.length - 1]
        let neighborName = neighbor.replace(neighborOctave,"")
        neighborOctave = parseInt(neighborOctave)
        playNote(name,octave,0.5)
        setTimeout(()=>playNote(neighborName,neighborOctave,0.5),220)
        setTimeout(()=>playNote(name,octave,0.5),440)
    }
    else{
        playNote(name,octave,1)
    }
    playNote(name,octave,1)
    return new Note(name,octave)
}

const thirdSixth = [2,5]
function randHarmNote(prevIndexIntvl,noteAgainst,prevHarmIndex){
    const noteAgainstIndex = allPianoSharps.indexOf(noteAgainst.name + String(noteAgainst.octave))
    if(!prevIndexIntvl){
        const intvls = [2,4,7]
        const randIndex = intvls[Math.round(Math.random() * 2)]
        const newNoteStr = allPianoSharps[noteAgainstIndex + randIndex]
        const octave = newNoteStr[newNoteStr.length - 1]
        const name = newNoteStr.replace(octave,"")
        return new Note(name,parseInt(octave))
    }
    else {
        let intvls = [2,2,2,3,4,5,5,7]
        if(prevIndexIntvl == 4){
            intvls = [2,2,2,3,5,5,5,7]
        }
        else if(prevIndexIntvl == 8){
            intvls = [2,2,2,3,4,5,5,5]
        }
        const randIndex = noteAgainstIndex - intvls[Math.round(Math.random() * 7)]
        const newNoteStr = allPianoSharps[randIndex]
        let octave = newNoteStr[newNoteStr.length - 1]
        const name = newNoteStr.replace(octave,"")
        octave = parseInt(octave)
        const randNeighbor = randToggle[Math.round(Math.random() * 1)]
        if(randNeighbor){
            const neighbor = allPianoSharps[randIndex + oneOrNeg[Math.round(Math.random() * 1)]]
            let neighborOctave = neighbor[neighbor.length - 1]
            let neighborName = neighbor.replace(neighborOctave,"")
            neighborOctave = parseInt(neighborOctave)
            playNote(name,octave,0.5)
            setTimeout(()=>playNote(neighborName,neighborOctave,0.5),220)
            setTimeout(()=>playNote(name,octave,0.5),440)
        }
        else{
            playNote(name,octave,1)
        }
        return new Note(name,octave)
    }
}

function randVoice3(topVoicesIndexIntvl,noteAgainstIndex){
    let newIndex
    let intvls
    if(topVoicesIndexIntvl == 2){
        intvls = [2,5]
        newIndex = noteAgainstIndex - intvls[Math.round(Math.random() * 1)]
    }
    else if(topVoicesIndexIntvl == 3){
        newIndex = noteAgainstIndex - 2
    }
    else if(topVoicesIndexIntvl == 4){
        newIndex = noteAgainstIndex - 5
    }
    else if(topVoicesIndexIntvl == 5){
        intvls = [2,4]
        newIndex = noteAgainstIndex - intvls[Math.round(Math.random() * 1)]
    }
    else if(topVoicesIndexIntvl == 7){
        intvls = [-2,2,5]
        newIndex = noteAgainstIndex - intvls[Math.round(Math.random() * 2)]
    }
    const newNoteStr = allPianoSharps[newIndex]
    let octave = newNoteStr[newNoteStr.length - 1]
    const name = newNoteStr.replace(octave,"")
    octave = parseInt(octave)
    const randNeighbor = randToggle[Math.round(Math.random() * 1)]
    if(randNeighbor){
        const neighbor = allPianoSharps[newIndex + oneOrNeg[Math.round(Math.random() * 1)]]
        let neighborOctave = neighbor[neighbor.length - 1]
        let neighborName = neighbor.replace(neighborOctave,"")
        neighborOctave = parseInt(neighborOctave)
        playNote(name,octave,0.5)
        setTimeout(()=>playNote(neighborName,neighborOctave,0.5),220)
        setTimeout(()=>playNote(name,octave,0.5),440)
    }
    else{
        playNote(name,octave,1)
    }
    return new Note(name,octave)
}

function randVoice4(midVoicesIndexIntvl,topVoicesIndexIntvl,noteAgainstIndex){
    let newIndex
    let intvls
    if(topVoicesIndexIntvl == 2){
        if(midVoicesIndexIntvl == 2){
            newIndex = noteAgainstIndex - 7
        }
        else{
            newIndex = noteAgainstIndex - 2
        }
    }
    else if(topVoicesIndexIntvl == 3){
        newIndex = noteAgainstIndex - 2
    }
    else if(topVoicesIndexIntvl == 4){
        newIndex = noteAgainstIndex - 2
    }
    else if(topVoicesIndexIntvl == 5){
        intvls = [2,3]
        newIndex = noteAgainstIndex - intvls[Math.round(Math.random() * 1)]
    }
    else if(topVoicesIndexIntvl == 7){
        if(midVoicesIndexIntvl == 5){
            intvls = [2,4]
            newIndex = noteAgainstIndex - intvls[Math.round(Math.random() * 1)]
        }
        else{
            newIndex = noteAgainstIndex - 2
        }
    }
    const newNoteStr = allPianoSharps[newIndex]
    let octave = newNoteStr[newNoteStr.length - 1]
    const name = newNoteStr.replace(octave,"")
    octave = parseInt(octave)
    const randNeighbor = randToggle[Math.round(Math.random() * 1)]
    /*if(randNeighbor){
        const neighbor = allPianoSharps[newIndex + oneOrNeg[Math.round(Math.random() * 1)]]
        let neighborOctave = neighbor[neighbor.length - 1]
        let neighborName = neighbor.replace(neighborOctave,"")
        neighborOctave = parseInt(neighborOctave)
        playNote(name,octave,0.5)
        setTimeout(()=>playNote(neighborName,neighborOctave,0.5),500)
        setTimeout(()=>playNote(name,octave,0.5),1000)
    }
    else{
        playNote(name,octave,1)
    }*/
    playNote(name,octave,1)
    return new Note(name,octave)
}

const startingNote = keyInSharps[0] // str
const harmonizedStartingNote = randHarmNote(null,startingNote)

//Reminders: Element ID's need flats
//           playNote needs sharps

let prevIndexIntvl = allPianoSharps.indexOf(startingNote.name + String(startingNote.octave)) - allPianoSharps.indexOf(harmonizedStartingNote.name + String(harmonizedStartingNote.octave))
let voice2Index
let stoppingTime = false
let playing = false
function improvise(i,prevNote,prevHarmNote){
    let voice1 = prevNote
    let voice2 = prevHarmNote
    if(i == 1){
        playNote(prevNote.name,prevNote.octave,1)
        playNote(prevHarmNote.name,prevHarmNote.octave,1)
    }
    else if(i == 300 || stoppingTime){
        return
    }
    else {
        voice1 = randMelNote(prevNote)
        voice2 = randHarmNote(prevIndexIntvl,voice1,voice2Index)
        const voice1Index = allPianoSharps.indexOf(voice1.name + String(voice1.octave))
        voice2Index = allPianoSharps.indexOf(voice2.name + String(voice2.octave))
        const topVoicesIndexIntvl = voice1Index - voice2Index
        const voice3 = randVoice3(topVoicesIndexIntvl,voice2Index)
        const voice3Index = allPianoSharps.indexOf(voice3.name + String(voice3.octave))
        const midVoicesIndexIntvl = voice2Index - voice3Index
        const voice4 = randVoice4(midVoicesIndexIntvl,topVoicesIndexIntvl,voice3Index)
    }
    setTimeout(() => improvise(i + 1,voice1,voice2),660)
}

eyes = Array.from(document.querySelectorAll('.eye'))
teeth = Array.from(document.querySelectorAll('.tooth'))
function lightFace(){
    eyes.forEach(eye => {
        eye.style.backgroundColor = "red"
        setTimeout(()=> eye.style.backgroundColor = "blue",500)
        setTimeout(()=> eye.style.backgroundColor = "gold",1000)
    })
    teeth.forEach(tooth => {
        tooth.style.backgroundColor = "cyan"
        setTimeout(()=>tooth.style.backgroundColor = "green",500)
        setTimeout(()=>tooth.style.backgroundColor = "magenta",1000)
    })
    if(playing){
        setTimeout(lightFace,600);
    }
}

const playButton = document.querySelector("#play")
function startPlaying(){
    if(!playing){
        improvise(1,startingNote,harmonizedStartingNote)
        playButton.innerHTML = 'STOP'
        playing = true
        stoppingTime = false
        lightFace()
    }
    else{
        playButton.innerHTML = 'PLAY'
        stoppingTime = true
        playing = false
        eyes.forEach(eye => {
            setTimeout(()=>eye.style.backgroundColor = "black",650)
        })
        teeth.forEach(tooth => {
            setTimeout(()=>tooth.style.backgroundColor = "black",650)
        })
    }
}

//playButton.addEventListener('click',startPlaying)

window.addEventListener('keyup',startPlaying)