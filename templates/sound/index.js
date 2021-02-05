window.p5 = require('p5')

import sketch from './sketch'

const sketchInstance = new p5(sketch, document.getElementById('sketch'))

window.sketch = sketchInstance // useful for debugging