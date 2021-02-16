import p5 from "p5"

export default p => {

    p.setup = () => {
        //drawing
        p.createCanvas( p.windowWidth, p.windowHeight )
        console.log('sketch ;)')
    }

    p.draw = () => {
        p.circle(p.width/2, p.height/2, 25)
    }
}
