export const Scene = freeze(new class {
	#scene     = ''
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
		this.enum = Object.create(null)
		for(const [key, val] of entries(this)) {
			const scene = (/^is([A-Z][a-zA-Z\d]*)$/.exec(key) || [])[1]
			if (!scene) continue
			if (this.#scene === '' && val === true) this.#scene = scene
			defineProperty(this, key, {get(){return this.#scene === scene}})
			this.enum[scene] = scene
		} freeze(this.enum)
	}
	get current() {return String(this.#scene)}
	some(keyStr)  {return [String(keyStr).split('|')].flat().some(k=> k === this.#scene)}
	switch(scene, fn, ...args) {
		if (!hasOwn(this.enum, scene))
			throw ReferenceError(`Scene '${scene}' is not defined`)
		$trigger('Switching')
		dBody.attr('id', this.#scene=scene)
		isFun(fn) && fn(...args)
		$trigger(scene)
	}
})