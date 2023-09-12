import {R,L} from './direction.js'
export const Confirm = freeze(new class {
	get opened() {return byId('confirm') != null}
	get #btns()  {return byId('confirm').find('button')}
	open(content, fn1,fn2, val1='OK',val2='Cancel', {putCancelOnLeft=false}={}) {
		if (Confirm.opened) return
		byId('confirm_temp').appendTo(dBody)
		byId('confirm').showModal()
		this.#btns.forEach((btn, i, btns)=> {
			btn.text([val1,val2][i])
			btn.onclick   = _=> {this.#close([fn1,fn2][i]),$off(NS)}
			btn.onkeydown = e=> {e.key==`Arrow${[R,L][i]}` && btns[1^i].focus()}
		})
		const escFn = this.#btns[1^putCancelOnLeft].onclick
		$on(`keydown${NS}`,  e=> {e.key=='Escape' && (e.preventDefault(),escFn())})
		$on(`mousedown${NS}`,e=> {e.preventDefault()})
		$('#confirm').find('.content').text(content).end().opacity(1, 400)
	}
	#close(fn) {
		$('#confirm').opacity(0, 400).on('transitionend',
			e=> {e.target.remove();isFun(fn) && fn()})
	}
}); const NS='.CONFIRM'