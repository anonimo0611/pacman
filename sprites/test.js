import '../lib/extdom.js'
import '../lib/mouse.js'
import {Ticker,Timer} from '../lib/timer.js'
import {Disappear}    from '../src/actor/disappear.js'
import {DorpDownMenu} from '../lib/menu.js'
class AnimSelect extends DorpDownMenu {
	constructor(id) {super(id)}
	select(idx, close=true) {
		super.select(idx, close)
		changeActorAnim()
	}
}
const animSelect = new AnimSelect('animSelect')
const sliderForm = byId('slider')
const output = dqs('#preview');

let timerId1, timerId2
function changeActorAnim() {
	Ticker.stop();
	const value  = animSelect.value
	const dir    = dqs('#animPreview [name=dir]:checked').value
	const isGhs  = /ghost/.test(value)
	output.className = value

	const radioDisabeld = /default|lost|repaired|fright|bared/.test(value)
	$('#animPreview [name=dir]').prop('disabled', radioDisabeld)
	$('#animPreview .radioButtons').attr('data-disabled', radioDisabeld)

	if (!radioDisabeld) output.dataset.dir = dir
	else output.removeAttr('data-dir')

	const lostLoop = ()=> {
		Timer.set(2400, ()=> Timer.stop().set(17, changeActorAnim))
	}
	if (output.matches('.Pacman.lost')) {
		$('#lost').show()
		Timer.set(500, ()=> {new Disappear(output),lostLoop()})
	}
	else $('#lost').hide()
}
function brightness(input, isInit) {
	const v = input.valueAsNumber
	document.body.style.backgroundColor = `rgb(${v}%,${v}%,${v}%)`
	if (!isInit) settings.save()
}
function scale(input, isInit) {
	const s = (input.valueAsNumber / 100).toFixed(2)
	const h = dqs('main').offsetHeight
	dqs('main').style.transform = `scale(${s})`
	if (input.valueAsNumber > 100)
		dqs('main').style.height = (h/s) + 'px'
	if (!isInit) settings.save()
}
function wheelCtrlForSlider(e) {
	const input = (e.currentTarget.tagName == 'INPUT')
		? e.currentTarget : e.currentTarget.qs('input')
	if (!input) return
	if (input.id == 'bgBrightnessRng') brightness(input)
	if (input.id == 'scaleRng') scale(input)
}
function resetFormCtrls() {
	sliderForm.reset()
	for (const input of dqsAll('[type="range"]')) {
		if (input.id == 'bgBrightnessRng') brightness(input)
		if (input.id == 'scaleRng') scale(input)
	}
	animSelect.reset()
	changeActorAnim()
}
$('#resetBtn').on('click', resetFormCtrls)
$('#slider input').on('input', wheelCtrlForSlider)
$('#animPreview [name=dir]').on('change', changeActorAnim)

const settings = {
	save() {
		const data = {}
		for (let i of dqsAll('[type=range]')) data[i.id] = i.value
		localStorage.sprites = JSON.stringify(data)
	},
	restore() {
		const data = JSON.parse(localStorage.sprites || null) || {}
		for (const id in data) {
			const ctrl = byId(id)
			if (ctrl) {
				ctrl.value = data[id]
				if (ctrl.id == 'scaleRng') scale(ctrl, true)
				if (ctrl.id == 'bgBrightnessRng') brightness(ctrl, true)
				ctrl.trigger('input')
			}
		}
		document.body.opacity(1)
	}
}
$(window).on('load', settings.restore)