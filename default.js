let drawPoint = (x, y, color) => point(x + canvasMidX, y + canvasMidY, color)
let clearCanvas = () => clear()

writeFn(clearCanvas)

let colorIdx = 0

for (let x = -50; x < 50; x += 10) {
  for (let y = -50; y < 50; y += 10) {
    let color = colorIdx % 2 === 0 ? "red" : "blue"
    writeFn(drawPoint, x, y, color)
  }

  colorIdx++
}
