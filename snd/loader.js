const Manifest = [
{src:'./res/looped.ogg', data:{channels:3, audioSprite:[
	{id:'start',   startTime:14233, duration:5000},
	{id:'siren0',  startTime:    0, duration: 402},
	{id:'siren1',  startTime: 1402, duration: 327},
	{id:'siren2',  startTime: 2730, duration: 298},
	{id:'siren3',  startTime: 4028, duration: 265},
	{id:'fright',  startTime: 6561, duration: 538},
	{id:'toHouse', startTime: 5292, duration: 268},
	{id:'cutscene',startTime: 8059, duration:5686},
	]}
},{src:'./res/regular.ogg', data:{channels:4, audioSprite:[
	{id:'eat0',   startTime: 1998, duration:  30},
	{id:'eat1',   startTime: 2137, duration:  30},
	{id:'losing', startTime:    0, duration:1749},
	{id:'bitten', startTime: 2603, duration: 575},
	{id:'extend', startTime: 3641, duration:2090},
	{id:'fruit',  startTime: 5952, duration: 496},
	]}
}]
const Config = new Map()
	.set('_normal', {loop: 0, volume:1.00})
	.set('eat',     {loop: 0, volume:0.80})
	.set('extend',  {loop: 0, volume:0.70})
	.set('cutscene',{loop: 1, volume:1.00})
	.set('fright',  {loop:-1, volume:0.55})
	.set('siren',   {loop:-1, volume:0.80})
	.set('toHouse', {loop:-1, volume:0.90})

export default freeze(new class Loader {
	static {
		let  amount = 0
		this.failed = true
		createjs.Sound.registerSounds(Manifest)
		createjs.Sound.on('fileload', _=> {
			if (++amount < Manifest.length) return
			!(this.failed=false) && $trigger('SoundLoaded')
		})
	}
	ids = freeze(Manifest.flatMap(m=> m.data.audioSprite.map(s=> s.id)))
	get failed() {return Loader.failed}
	configMerged(id, cfg={}) {
		const prefix = isStr(id) && id.match(/^\D+/)?.[0] || null
		return {...Config.get(prefix) || Config.get('_normal'), ...cfg}
	}
})