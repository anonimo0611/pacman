import {Dir}          from '../lib/direction.js'
import {Confirm}      from '../lib/confirm.js'
import {Status}       from './main.js'
import {LevelMenu}    from './menu.js'
import {dBoard,dSize} from './elems.js'
import * as Menu      from './menu.js'

export const Ctrl = new class {
	static {$one('BoardLoaded', this.setup)}
	static setup() {
		Ctrl.#restore()
		Ctrl.#setupFormCtrls()
		$('.panel').hide()
		$on('resize',   Ctrl.#fitToViewport)
		$on('SaveData', Ctrl.#saveData)
		$on('ChgLevel', Ctrl.#setDataToHTML)
	}

	dirFrom = e=> Dir.from(e?.code, {awsd:true}) || null

	#fitToViewport() {
		const scale = (dRoot.dataset.size == 'viewport')
			? min(innerWidth/dBoard.width*.98, innerHeight/dBoard.height)
			: 1
		dBoard.transform({scale})
	}
	get livesMax()     {return +Form.lvsRng.value}
	get speedRate()    {return +Form.spdRng.value}
	get extendVal()    {return +Menu.ExtendScoreMenu.value}
	get isChaseMode()  {return Form.chsChk.checked == true}
	get consecutive()  {return Form.onlChk.checked == false}
	get unrestricted() {return Form.unrChk.checked == true}
	get invincible()   {return Form.invChk.checked == true}
	get showTargets()  {return Form.trgChk.checked == true}
	get isCheatMode()  {return Ctrl.speedRate<.7 || Ctrl.invincible  ||  Ctrl.showTargets}
	get isPractice()   {return !!LevelMenu.index && Ctrl.consecutive || !Ctrl.consecutive}
	#saveData() {
		const data = {size: dSize.className}
		for (const ctrl of dqsAll('.menu,[type=range],[type=checkbox]')) {
			data[ctrl.id] = {
				menu:    Menu[ctrl.id]?.index,
				range:  +ctrl.value,
				checkbox:ctrl.checked,
			}[ctrl.type]
		}
		localStorage.anopacman = JSON.stringify(data)
		return this
	}
	#removeData() {
		localStorage.removeItem('anopacman')
		localStorage.removeItem('anopac_hiscore')
		Ctrl.#setDefault()
	}
	#restore() {
		const data = JSON.parse(localStorage.anopacman || null) || {}
		for(const [id, val] of entries(data)) {
			if (!byId(id)) continue
			if (id.endsWith('Rng'))  byId(id).value   = val
			if (id.endsWith('Chk'))  byId(id).checked = val
			if (id.endsWith('Menu')) Menu[id].select(val, {restore:true})
			if (id == 'size') {
				byId(id).className = val
				dRoot.dataset.size = val == 'toFit' ? 'actual':'viewport'
			}
			byId(id).trigger('input').trigger('change')
		}
		Ctrl.#fitToViewport()
		Ctrl.#setDataToHTML()
		$trigger('Restore', true)
	}
	#setDefault() {
		Form.reset()
		Ctrl.#saveData().#restore()
	}
	#setDataToHTML() {
		dBoard.dataset.grid	  = Form.grdChk.checked
		dBoard.dataset.cheats = Ctrl.invincible  || Ctrl.showTargets
		dBoard.dataset.prac   = Ctrl.isCheatMode || Ctrl.isPractice
		dqs('.info.l').opacity(Ctrl.isCheatMode  || Ctrl.speedRate != 1)
		dqs('.info.r').opacity(Ctrl.unrestricted)
		dqs('#spdRate').textContent     = Ctrl.speedRate.toFixed(1)
		dqs('#spdInfo').dataset.enabled = Ctrl.speedRate != 1
		dqs('#invInfo').dataset.enabled = Ctrl.invincible
		dqs('#trgInfo').dataset.enabled = Ctrl.showTargets
		dqs('#unrInfo').dataset.enabled = Ctrl.unrestricted
	}
	#setupFormCtrls() {
		Form.clearStorageBtn.on('click', _=> {
			Confirm.open('Are you sure you want to clear local storage?',
				null, Ctrl.#removeData, 'No','Yes', {putCancelOnLeft:true})
		})
		dSize.on('click','button', function() {
			const btn = dSize.find('button')[1^$(this).index()]
			dRoot.dataset.size = (this.textContent == 'Fit') ? 'viewport':'actual'
			dSize.attr('class',`to${btn.textContent}`) && btn.focus()
			Ctrl.#saveData().#fitToViewport()
		})
		dqsAll('.panelBtn').forEach(btn=> {
			const id = btn.classList.item(1)
			$(btn).on('click', _=> $('.panel').toggle())
			$on('click', e=> {!e.target.closest(`.${id}`) && $(`#${id}`).hide()})
		})
		$('input').on('input change', Ctrl.#saveData)
		$('#defBtn').on('click', Ctrl.#setDefault)
		$('.setInf').on('input', Ctrl.#setDataToHTML)
	}
}, Form = document.forms[0]