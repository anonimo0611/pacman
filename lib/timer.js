const TimerMap = new Map()
export const Ticker = freeze(class {
	static #symbol  = Symbol()
	static #count   = 0
	static #ticker  = null
	static #paused  = false
	static FPeriod  = 1000/60
	static get count()   {return this.#count}
	static get paused()  {return this.#paused}
	static get running() {return this.#ticker instanceof this}
	static pause(force)  {return this.#paused=!!(isBool(force)? force : !this.#paused)}
	static set(...args)  {new Ticker(this.#symbol, ...args)}
	static stop()        {this.#ticker?.stop();return this}
	static resetCount()  {this.#ticker?.resetCount();return this}
	constructor(symbol, fn=null, {delay=0}={}) {
		if (symbol != Ticker.#symbol)
			throw TypeError(`The constructor ${this.constructor.name}() is not visible`)
		Ticker.#ticker?.stop()
		Ticker.#ticker = this
		this.fn    = isFun(fn) ? fn : null
		this.delay = isNum(delay) ? delay : 0
		this.start = this.stopped = 0
		this.loop  = this.loop.bind(this)
		requestAnimationFrame(this.loop)
	}
	loop(ts) {
		if (this.stopped) return
		requestAnimationFrame(this.loop)
		if (ts-(this.start ||= ts) <= this.delay) return
		if ((ts-this.start)/Ticker.FPeriod >= Ticker.count)
			!Ticker.paused && this.tick()
	}
	tick() {
		if (this.stopped) return
		TimerMap.forEach(this.timer)
		this.fn?.()
		Ticker.#count++
	}
	timer(t, key) {
		if (Timer.frozen && !t.ignoreFrozen)  return
		if (Ticker.FPeriod*t.amount++ < t.ms) return
		TimerMap.delete(key) && t.fn()
	}
	stop() {
		TimerMap.clear()
		Timer.unfreeze()
		this.stopped   = 1
		Ticker.#count  = 0
		Ticker.#ticker = null
		Ticker.#paused = false
	}
	resetCount() {Ticker.#count = this.start = 0}
})
export const Timer = freeze(new class {
	#frozen = false
	get frozen() {return this.#frozen}
	freeze()   {this.#frozen = true; return this}
	unfreeze() {this.#frozen = false;return this}
	set(ms, fn=_=>{}, {key=null,ignoreFrozen=Timer.frozen}={}) {
		if (!isNum(ms)) throw TypeError(`'${ms}' is not a number`)
		if (!isFun(fn)) throw TypeError(`'${fn}' is not a function`)
		!Ticker.running && Ticker.set()
		TimerMap.set(key ?? Symbol(), {ms,fn,ignoreFrozen,amount:0})
	}
	sequence(...seq) {
		(seq=seq.flatMap(s=>isArray(s) ? {ms:s[0],fn:s[1]} : [])).forEach(s=> {
			if (!isNum(s.ms)) throw TypeError(`'${s.ms}' is not a number`)
			if (!isFun(s.fn)) throw TypeError(`'${s.fn}' is not a function`)
		})
		let idx=0, s=seq[idx]
		function fire() {
			seq[idx].fn()
			;(s=seq[++idx]) ? Timer.set(s.ms, fire) : fire=null
		} seq.length && Timer.set(s.ms, fire)
	}
	stop() {Ticker.stop();return this}
	cancel(key) {TimerMap.delete(key);return this}
})