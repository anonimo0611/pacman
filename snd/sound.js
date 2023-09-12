import Loader  from './loader.js'
import {Scene} from '../src/scene.js'
import {Ghost} from '../src/actor/ghost.js'
import {Form}  from '../src/control.js'
import {Ticker,Timer} from '../lib/timer.js'

const InstanceMap = new Map()
const SirenIds = freeze(integers(4).map(i=>`siren${i}`))

export const Sound = new class {
	static {$one('SoundLoaded', this.setup)}
	static setup() {
		Loader.ids.forEach(id=> InstanceMap.set(id, createjs.Sound.createInstance(id)))
		$('.volCtrl').addClass('show')
		$('.volRng') .on('input', Sound.#applyVol).eq(0).trigger('input')
		$('#speaker').on('wheel', Sound.#applyVol).on('click', Sound.#mute)
		$on('keydown', e=> {/^M$/i.test(e.key) && Sound.#mute()})
	}
	#lstVol = null
	get vol()      {return createjs.Sound.volume * 10}
	get disabled() {return Loader.failed}
	get #sirenId() {return SirenIds[Ghost.eloryPart]}
	set #vol(vol) {
		if (Sound.disabled) return
		createjs.Sound.volume = vol / 10
		dqs('#speaker').css('--w', (v=> {
			if (v == 0) return 0
			if (between(v, 8, 10)) return 3
			if (between(v, 4,  7)) return 2
			if (between(v, 1,  3)) return 1
		})(vol))
	}
	#applyVol(e) {
		Sound.#vol = (e.type == 'input' ? e.target : Form.volRng).valueAsNumber
	}
	#mute() {
		Sound.#lstVol = Sound.vol || (Sound.#lstVol ?? +Form.volRng.max)
		const value = Sound.vol ? 0 : Sound.#lstVol
		Form.volRng.prop({value}).trigger('input') && (Sound.#vol = value)
	}
	play(id, cfg={}) {
		if (Sound.disabled || Scene.isDemo || !InstanceMap.has(id)) return
		cfg = Loader.configMerged(id, cfg)
		isNum(cfg.duration) && InstanceMap.get(id).setDuration(cfg.duration)
		InstanceMap.get(id).play(cfg)
	}
	playSiren() {
		if (!Ghost.active || Ghost.frightened) return
		!dqs('.toHouse') && Sound.stop('fright').stopSiren().play(Sound.#sirenId)
	}
	playFright() {
		!dqs('.toHouse') && Sound.stopSiren().play('fright')
	}
	stop(...ids) {
		if (Sound.disabled) return this
		if (!ids.length) createjs.Sound.stop()
		ids.forEach(id=> {InstanceMap.get(id)?.stop()})
		return this
	}
	stopSiren = _=> Sound.stop(...SirenIds)
	stopLoops = _=> Sound.stopSiren().stop('fright','toHouse')
	pause(id) {
		!arguments.length
			? InstanceMap.forEach(i=> i.paused = true)
			: InstanceMap.has(id) && (InstanceMap.get(id).paused = true)
	}
	resume(id) {
		if (Sound.disabled || Ticker.paused) return
		if (Scene.some('Title|Demo|Ready'))  return
		!arguments.length
			? InstanceMap.forEach(i=> i.paused = false)
			: InstanceMap.has(id) && (InstanceMap.get(id).paused = false)
	}
	ghsReturnToHouse() {
		Sound.stopSiren().stop('fright').play('toHouse')
	}
	ghsArrivedHome() {
		if (dqs('.toHouse') || Timer.frozen) return
		Sound.stop('toHouse').play(Ghost.frightened? 'fright' : Sound.#sirenId)
	}
}; freeze(Sound)