import {Sound}        from '../snd/sound.js'
import {L,R}          from '../lib/direction.js'
import {Confirm}      from '../lib/confirm.js'
import {Ticker,Timer} from '../lib/timer.js'
import {Game}         from './main.js'
import {Scene}        from './scene.js'
import {Ctrl}         from './control.js'
import {FrightMode}   from './actor/ghost.js'
import {dPac,dAka,GhsElms} from './actor/actelem.js'

(new class { // The attract demo begins after 30 seconds of inactivity
	WaitTime = 1e3 * 30 // ms
	constructor() {
		$on('focus Title',   _=> Scene.isTitle && this.start())
		$on('blur Switching',_=> Scene.isTitle && this.stop())
	}
	start() {
		const evs = $evsNS('mousemove wheel click keydown resize','.STANDBY')
		$offon(evs, _=> this.reset()) && Ticker.set(_=> this.loop())
	}
	reset() {
		Ticker.resetCount()
	}
	stop()  {
		Ticker.stop() && $off('.STANDBY')
	}
	loop() {
		if (Confirm.opened || dqs(':not(#startBtn):focus'))
			return this.reset()
		if (Ticker.count*Ticker.FPeriod >= this.WaitTime)
			Demo.begin()
	}
})

const Demo = new class {
	begin() {
		Scene.switch('Demo', Demo.#setup)
		const elms = [...byId('demo').find('thead,td,.bonusGuide')]
		Ticker.set(_=> {
			if (Ticker.count % (elms[0]?.cellIndex ? 30 : 60) != 0)
				return
			elms.shift().opacity(1)
			elms.length == 0 && Timer.stop().set(500, Demo.#setAnim)
		})
	}
	#setup() {
		dBody.className = dBody.id
		dqs('#demo_temp').appendTo(dBoard)
		Ctrl.extendVal < 0
			? dqs('#demo .aboutExtend').remove()
			: dqs('#demo .extendScore').text(Ctrl.extendVal)
		$on($evsNS('click keydown blur','.DEMO'), Demo.#end)
	}
	#setAnim() {
		const scr  = dqs('#demoAct')
		const objs = [...scr.find('div')]
		objs.slice(1).reverse().forEach((a, i, objs)=> {
			a.prop({movDir:L})
			 .transform({y:(a.height-scr.height)/2})
			 .transform({x:i? objs[i-1].trX-a.width*.96 : scr.width-a.width})
		})
		const fn = _=> !scr.qs('.ghs') && Demo.#end()
		Ticker.set(_=> objs.length && Demo.#anim(objs[0], {fn,scr}))
		byId('demo').removeClass('standbyAnim')
	}
	#anim(pow, cfg) {
		if (Timer.frozen)
			return
		if (dPac.trX < 0)
			dPac.movDir = R
		if (pow.width && dPac.trX <= pow.width/2) {
			new FrightMode()
			$(GhsElms).prop({movDir:R}) && pow.remove()
		}
		dPac.moveByDir(dPac.movDir, 3.4, true)
		Ticker.count > 9 && GhsElms.forEach(g=> {
			g.moveByDir(L, g.movDir == L ? 3.6 : -1.7)
			g.circleCollision(dPac.trPos, g.width/7)
				&& Game.showPoint(g.trigger('Bitten'), cfg)
				&& g.remove()
		})
	}
	#end(e) {
		if (e?.target.tagName == 'BUTTON')
			return
		Ticker.stop() && $off('.DEMO')
		$('#cfgDialog').hide()
		$('#demo').remove()
		e? setTimeout(_=> $trigger('EndDemo'), 0)
		 : Demo.begin()
	}
}

export class Cutscene {
	static #symbol = Symbol()
	static {
		$('button.cutscn').on('click', e=> this.begin(+e.target.value))
	}
	static begin(num={3:1, 6:2, 10:3}[Game.level]) {
		if (num === 0)
			return void Demo.begin()
		if (Scene.isCutscene || !between(num, 1,3))
			return false

		Scene.switch('Cutscene', this.#setup)
		Sound.play('cutscene', {loop:1^num == 2})
		return !!new Cutscene(this.#symbol, num)
	}
	static #setup() {
		dBody.className = 'Demo CB'
		dqs('#coffeeBreak_temp').appendTo(dCB)
	}
	constructor(symbol, snum) {
		if (symbol != Cutscene.#symbol)
			throw TypeError(`The constructor ${this.constructor.name}() is not visible`)

		this.pacStopped = false
		const {x, y}= this.centerPos={x:dCB.width/2, y:(dCB.height-dAka.height)/2}
		if (snum == 2) {
			this.counter = {elapsedCnt:-1, spriteIdx:0}
			this.stake = makeDiv('#stake').transform(x, y).appendTo(dCB)
			this.cloth = makeDiv('#cloth').transform(x, y).appendTo(dCB)
		}
		dPac.transform(x*2+110, y)
		dAka.transform(x*2+(snum == 1 ? 202:240), y)
		Ticker.set(_=> {
			this.isR = (this.dir ??= L) == R
			!(this.pacStopped || snum > 1 && dPac.trX+dPac.width < 0)
				&& dPac.moveByDir(this.dir, 3.3, true)
			this[`scene${snum}`](this)
		})
		$on('blur.CB focus.CB', this.pause).on('Quit.CB', this.end)
	}
	scene1({dir,isR}) {
		if (dPac.trX < -dPac.width*6) {
			this.pacStopped  = true
			dPac.dataset.dir = this.dir = R
			dPac.transform({scale:3})
			dAka.addClass('fright')
		}
		dAka.moveByDir(dir, !isR ? 3.58 : 2.17)
		if (isR && dAka.trX > dAka.width*1.6)
			this.pacStopped = false
		if (isR && dAka.trX > dPac.width*8+dCB.width)
			this.end()
	}
	scene2({centerPos,counter:c}) {
		const step = 3.3
		if (dAka.trX-step > centerPos.x)
			return void dAka.moveByDir(L, step)
		if (c.elapsedCnt < 0)
			dAka.transform(centerPos.x).addClass('clothesGotCaught')

		++c.elapsedCnt < 94 && dAka.moveByDir(L, .225)
		;[27,59,130].includes(c.elapsedCnt)
			&& this.cloth.css('--n', ++c.spriteIdx)

		switch (c.elapsedCnt) {
		case   0: return void this.cloth.opacity(1)
		case  94: return void dAka.addClass('stopped')
		case 130: return void dAka.addClass('ripped')
		case 190: return void dAka.addClass('last')
		case 270: this.end()
		}
	}
	scene3({dir,isR}) {
		!Ticker.count && dAka.addClass('repaired')
		dAka.moveByDir(dir, !isR ? 3.3 : 3.5)

		if (dAka.trX < -dAka.width*6)
			dAka.addClass('bared') && (this.dir = R)
		if (dAka.trX > dAka.width*8+dCB.width && isR)
			this.end()
	}
	pause() {
		Ticker.pause()
			? Sound.pause()
			: Sound.resume()
		dBoard.dataset.paused = Ticker.paused
	}
	end() {
		Ticker.stop() && $off('.CB')
		$(dCB).empty()
		$trigger('EndDemo')
	}
} freeze(Cutscene)