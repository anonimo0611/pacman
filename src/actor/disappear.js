import {Ticker}    from '../../lib/timer.js';
import {SpriteImg} from '../elems.js';

const cvs  = byId('lost')
const ctx  = cvs.getContext('2d')
const SIZE = cvs.width
const DIS_DURATION  = 1149/Ticker.FPeriod
const LINE_DURATION =  300/Ticker.FPeriod
const LINE_FADEOUT  =  300/Ticker.FPeriod

const getCircum = (degree,r,cx,cy)=> {
	const x = cos(PI/180*degree) * r + cx
	const y = sin(PI/180*degree) * r + cy
	return {pos:{x, y}, values:[x, y]}
}

export class Disappear {
	#innerR    = 0
	#outerR    = 0
	#disAngle  = 1
	#lineAlpha = 1
	get StR() {return SIZE/3.0}
	get EdR() {return SIZE/2.2}
	constructor(dPac, {x=0,y=0,Sound}={}) {
		Sound?.play('losing')
		$(cvs.transform({x,y})).show()
		this.#innerR = SIZE/9.6
		this.#outerR = this.StR
		this.loop()
	 	dPac.removeClass('prep')
		Ticker.stop().set(this.loop.bind(this))
	}
	loop() {
		ctx.clearRect(0,0,SIZE,SIZE)
		this.#disAngle < 180
 			? this.#disappear()
	 		: this.#drawLines()
	}
	#disappear() {
		const angle = min(this.#disAngle += 180/DIS_DURATION, 179) * PI/180
		ctx.save()
		ctx.translate(SIZE/2, SIZE/2)
		ctx.beginPath()
		ctx.moveTo(0,SIZE/6)
		ctx.arc(0,0, SIZE/2*1.2, -PI/2-angle,-PI/2+angle, true)
		ctx.clip()
		ctx.drawImage(SpriteImg, -SIZE/2,-SIZE/2)
		ctx.restore()
	}
	#drawLines() {
		const ir = min(this.#innerR += this.StR/LINE_DURATION, this.StR)
		const or = min(this.#outerR += this.EdR/LINE_DURATION, this.EdR)
		ctx.save()
		ctx.translate(SIZE/2, SIZE/2)
		if (this.#outerR >= this.EdR) {
			ctx.globalAlpha = max(this.#lineAlpha -= 1/LINE_FADEOUT, 0)
		}
		for (let deg=0; deg<360; deg+=360/10) {
			ctx.beginPath()
	 		ctx.moveTo(...getCircum(deg, ir, 0, SIZE/24).values)
	        ctx.lineTo(...getCircum(deg, or, 0, SIZE/24).values)
			ctx.lineWidth   = SIZE/12
			ctx.strokeStyle = 'yellow'
	        ctx.stroke()
		}
		ctx.restore()
	}
}