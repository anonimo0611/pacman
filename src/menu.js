import {dFruit} from './elems.js'
import * as MenuBase from '../lib/menu.js'

export const LevelMenu = new class extends MenuBase.DorpDownMenu {
	constructor() {
		super('LevelMenu')
		this.lis.forEach(li=> li.css('--o', +li.dataset.val))
	}
	select(idx=this.index, {close=true, restore=false}={}) {
		super.select(idx, {close})
		!restore && $trigger('SaveData')
		$trigger('ChgLevel', idx+1)
		$([this.current,dFruit]).css('--o', this.value)
	}
}
export const ExtendScoreMenu = new class extends MenuBase.SlideMenu {
	constructor() {
		super('ExtendScoreMenu')
	}
	select(idx, {restore=false}={}) {
		super.select(idx)
		!restore && $trigger('SaveData')
	}
}