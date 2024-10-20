export const Scene = freeze(new class {
	#scene     = ''
	#enumSet   = new Set()
	isTitle    = true
	isStart    = false
	isReady    = false
	isPlaying  = false
	isAteAll   = false
	isLostLife = false
	isCutscene = false
	isQuit     = false
	isDemo     = false
	constructor() {
		for(const [key, val] of entries(this)) {
			const scene = (/^is([A-Z][a-zA-Z\d]*)$/.exec(key) || [])[1]
			if (!scene) continue
			if (this.#scene === '' && val === true) this.#scene = scene
			defineProperty(this, key, {get(){return this.#scene === scene}})
			this.#enumSet.add(scene)
		}
	}
	get iter()    {return this.#enumSet.values()}
	get current() {return String(this.#scene)}
	some(keyStr)  {return splitByBar(keyStr).some(k=> k === this.#scene)}
	switch(scene, fn, ...args) {
		if (!this.#enumSet.has(scene))
			throw ReferenceError(`Scene '${scene}' is not defined`)
		$trigger('Switching') && document.body.attr('id', this.#scene=scene)
		isFun(fn) && fn(...args), $trigger(scene)
	}
})