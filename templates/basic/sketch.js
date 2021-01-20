window.p5 = require('p5')


export default p => {

    //declare
    let center

    //parameterize
    const params = {}

    //hooks
    p.preload = () => console.log("sketch: ;)")

    p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
        center = new p5.Vector(p.width, p.height).mult(0.5)
    }

    p.draw = () => {
        p.fill(128)
        p.circle(center.x, center.y, 100)
    }

}
