
/*

*/

const noteRegex = new RegExp('[A-G](#|b)*$','i')

const noteNames = ["C","D","E","F","G","A","B"]
const notePitches = [0,2,4,5,7,9,11]
const rhythmValues = [1024,512,256,128,64,32,16,8,4,2,1]
const rhythmNames = ["double whole","whole","half","quarter",
                    "8th","16th","32nd","64th","12th","256th","512th"]
const nonNaturals = [1,3,,6,8,10]


class Note {

    constructor(name, octave, rhythm, dots, triplet) {
        this.name = name
        this.octave = octave || 4
        this.dots = dots || 0
        this.triplet = triplet || false
        if (!name.match(noteRegex)) {
            throw "Note name error."
        }

        this.letter = noteNames.indexOf(name[0])

        this.pitch = notePitches[this.letter]
        if(this.name.includes('#')){
            this.pitch += this.name.length - 1
            if(this.pitch > 11){
                this.pitch -= 12
            }
        }
        else if(this.name.includes('b')){
            this.pitch -= this.name.length - 1
            if(this.pitch < 0){
                this.pitch += 12
            }
        }
        
        if(this.octave){
            this.hardPitch = this.octave * 12 + this.pitch
        }
        this.rhythm = {value: rhythm, len: rhythmValues[rhythm], name: rhythmNames[rhythm]}
        if(this.dots){
            var originalVal = this.rhythm.len
            var i
            for(i=0;i<this.dots;i++){
                this.rhythm.len += (originalVal/Math.pow(2,i + 1))
            }
        }
        if(this.triplet){
            this.rhythm.len *= (2/3)
        }
    }

    static fromPitchLetter(pitch,letter,octave,rhythm,dots,triplet){
        octave = octave || null
        rhythm = rhythm || null
        dots = dots || null
        triplet = triplet || null
        var name = noteNames[letter]
        var pitchOffset
        if(pitch != notePitches[letter]){
            pitchOffset = pitch - notePitches[letter]
            if(pitchOffset > 5){
                pitchOffset = pitch - 12
            }
            if(pitchOffset < -5){
                pitchOffset = pitch + 12
            }
            if(pitchOffset > 0){
                name += "#".repeat(pitchOffset)
            }
            else{
                name += "b".repeat(Math.abs(pitchOffset))
            }
        }
        return new Note(name,octave,rhythm,dots,triplet)
    }

    static fromHardPitch(hardPitch,preferFlat,rhythm,dots,triplet){
        rhythm = rhythm || null
        dots = dots || null
        triplet = triplet || null
        preferFlat = preferFlat || false
        const octave = Math.floor(hardPitch / 12)
        console.log(rhythm)
        const pitch = hardPitch % 12
        var i
        for( i = 0 ; i < 7 ; i++ ){
            if(notePitches[i] == pitch){
                return new Note(noteNames[i],octave,rhythm,dots,triplet)
            }
            else if(notePitches[i] + 1 == pitch){
                if(preferFlat){
                    if(i == 6){
                        i = -1
                    }
                    return new Note(noteNames[i + 1] + "b",octave,rhythm,dots,triplet)
                }
                else{
                    return new Note(noteNames[i] + "#",octave,rhythm,dots,triplet)
                }
            }
        }
        
    }

    static fromFrequency(Hz,preferFlat,rhythm,dots,triplet){
        rhythm = rhythm || null
        dots = dots || null
        triplet = triplet || null
        preferFlat = preferFlat || false
        const hardPitch = Math.round((12 * (Math.log2(Hz) - Math.log2(440)))) + 57
        return Note.fromHardPitch(hardPitch,preferFlat,rhythm,dots,triplet)
    }


    enharmonic(prefer){
        prefer = prefer || null
        let newLetter
        if(this.name.length == 1){
            return this
        }
        else if(this.name.length == 2){
            if(this.name.includes("#")){
                if(prefer == "#"){
                    return this
                }
                newLetter = this.letter + 1
                if(newLetter > 6){
                    newLetter -= 7
                }
            }
            else{
                if(prefer == "b"){
                    return this
                }
                newLetter = this.letter - 1
                if(newLetter < 0){
                    newLetter += 7
                }
            }
            return Note.fromPitchLetter(this.pitch,newLetter,this.octave,this.rhythm.value,this.dots,this.triplet)
        }
        else{
            newNote = this
            limit = nonNaturals.includes(this.pitch) ? 2 : 1
            newLetter = this.letter
            while(newNote.name.length > limit){
                if(this.name.includes("#")){
                    newLetter += 1
                    if(newLetter > 6){
                        newLetter -= 7
                    }
                }
                else{
                    newLetter -= 1
                    if(newLetter < 0){
                        newLetter += 7
                    }
                }
                newNote = Note.fromPitchLetter(this.pitch,newLetter,this.octave,this.rhythm.value,this.dots,this.triplet)
            }
        return newNote
        }
    }
}

const bases = [
    "uni","2nd","3rd",
    "4th","5th","6th",
    "7th"
]
const baseIntervals = [
    [0],[1,2],[3,4],
    [5],[7],[8,9],
    [10,11]
]

const mQuals = ["2nd","3rd","6th","7th"]

class Interval{

    constructor(quality,base,displace) {
        this.displace = displace || 0
        this.quality = quality
        this.base = base
        this.letterDifference = bases.indexOf(this.base)

        if(this.quality == "per" || this.quality == "min"){
            const baseChange = baseIntervals[bases.indexOf(this.base)][0]
            this.pitchDifference = baseChange + 12 * this.displace
        }
        else if(this.quality == "maj"){
            const baseChange = baseIntervals[bases.indexOf(this.base)][1]
            this.pitchDifference = baseChange + 12 * this.displace
        }
        else if(this.quality.slice(0,3) == "aug"){
            var more = 1
            if(this.quality.length > 3){
                more = parseInt(this.quality.slice(3))
            }
            var baseChange
            if(mQuals.includes(this.base)){
                baseChange = baseIntervals[bases.indexOf(this.base)][1]
            }
            else{
                baseChange = baseIntervals[bases.indexOf(this.base)][0]
            }
            this.pitchDifference = baseChange + more + 12 * this.displace
        }
        else if(this.quality.slice(0,3) == "dim"){
            var less = 1
            if(this.quality.length > 3){
                less = parseInt(this.quality.slice(3))
            }
            const baseChange = baseIntervals[bases.indexOf(this.base)][0]
            this.pitchDifference = baseChange - less + 12 * this.displace
        }
    }   
}

modes = {
    major: [2,2,1,2,2,2,1],
    minor: [2,1,2,2,1,2,2],
}
/*! NEEDS MORE MORE MORE MORE MOOOOORE */
class Mode{

    constructor(rootNote,quality){
        if(rootNote instanceof Note){
            this.rootNote = rootNote
        }
        else{
            this.rootNote = new Note(rootNote)
        }
        this.name = rootNote + ' ' + quality
        this.quality = quality

        this.spelling = [this.rootNote]
        this.steps = modes[quality]
        var nextPitch = this.rootNote.pitch
        var nextLetter = this.rootNote.letter
        const maj2 = new Interval("maj","2nd")
        const min2 = new Interval("min", "2nd")
        var i
        var nextStep
        var n = 1
        for(i=0;i<this.steps.length;i++){
            if(n == this.steps.length){
                break
            }
            nextStep = this.steps[i]
            var intvl
            if(nextStep == 2){
                nextPitch += maj2.pitchDifference
                nextLetter += maj2.letterDifference
            }
            else if(nextStep == 1){
                nextPitch += min2.pitchDifference
                nextLetter += min2.letterDifference
            }
            if(nextPitch > 11){
                nextPitch -= 12
            }
            if(nextLetter > 6){
                nextLetter -= 7
            }
            this.spelling.push(Note.fromPitchLetter(nextPitch,nextLetter))
            n += 1
        }
    }
}

class Tempo {
    constructor(bpm){
        this.bpm = bpm
        /* beat len in milliseconds for JS */
        this.beatLen = 60000 / bpm
    }
}

class TimeSignature {

    constructor(top,bottom,bpm){
        bpm = bpm || null
        this.beatsPerMeas = this.top = top
        this.bottom = bottom
        this.getsBeat = new Note("C",null,Math.log2(bottom * 2))
        this.measureLen = this.getsBeat.rhythm.len * this.beatsPerMeas
        this.tempo = new Tempo(bpm)
    }
    
}