window.p5 = require('p5')
require('p5/lib/addons/p5.sound')


export default p => {

    //initialize
    let player;
    let url = 'http://limon.local:8000/audio/test.mp3'
    const colors = {
        unknown: p.color(255, 204, 0),
        playing: p.color(0, 255, 0),
        paused: p.color(255, 0, 0),
    }


    //hooks
    p.preload = () => {
        player = p.loadSound(url)
    }

    p.setup = () => {
        log(`click anywhere to play audio url ${url}`)
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.background(colors.unknown)
    }

    p.draw = () => {
        p.noLoop()
    }

    p.mousePressed = () => {
        if ( ! player.isPlaying()) {
            player.play()
            p.background(colors.playing)
        } else {
            player.pause()
            p.background(colors.paused)
        }
    }


    //methods
    const log = s => console.log('sketch:', s)
}
