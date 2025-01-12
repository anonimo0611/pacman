export const Cursor = freeze(new class {
	hide()    {this.#setState('hidden')}
	default() {this.#setState('default')}
	#setState(state) {dRoot.dataset.cursor = state}
	static {
		let timerId=0, lstPos={x:0, y:0}
		$on('mousemove', e=> {
			if (dRoot.dataset.cursor == 'always')
				return
			clearTimeout(timerId)
			timerId = setTimeout(_=> Cursor.#setState('stayStill'), 2e3)
			const {pageX:x, pageY:y}= e
			getDist(lstPos,{x, y}) > 2 && Cursor.default()
			lstPos = {x, y}
		})
	}
})
!(new class { // Enable mouse wheel on range controls
	setup(trg) {
		trg == document.body && $('form').on('reset', e=> this.setup(e.target))
		trg.find('input[type=range]').forEach(i=> this.setupRangeCtrl(i,trg))
	}
	setupRangeCtrl(ctrl,root) { // Labels must be block-level
		const ids     = ctrl.dataset.links?.trim().split(/\s+/) ?? []
		const label   = ctrl.closest('label') || dqs(`label[for="${ctrl.id}"]`)
		const output  = dqs(`output[for~="${ctrl.id}"]`) ?? []
		const ctrlSet = new Set(ids.flatMap(id=> dqs(`input#${id}`) ?? []))
		const onInput = _=> {$([...ctrlSet,output]).prop({value:ctrl.value})}
		const onWheel = e=> {
			e.preventDefault()
			0 < e.deltaY
				? ctrl.stepDown()
				: ctrl.stepUp()
			$(ctrl).trigger('input')
		}
		if (root != document.body)
			return $(output).text(+ctrl.defaultValue)
		ctrl.on('input', onInput) && $(output).text(ctrl.value)
		label?.addEventListener('wheel', onWheel)
		!ctrl.closest('label') && ctrl.addEventListener('wheel', onWheel)
	}
}).setup(document.body)