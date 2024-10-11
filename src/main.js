import '../lib/extdom.js'
import {Sound}        from '../snd/sound.js'
import {Cursor}       from '../lib/mouse.js'
import {Ticker,Timer} from '../lib/timer.js'
import {Confirm}      from '../lib/confirm.js'
import {Scene}        from './scene.js'
import {Ctrl,Form}    from './control.js'
import {Maze,Fruit}   from './maze.js'
import {Pacman}       from './actor/pacman.js'
import {Ghost}        from './actor/ghost.js'
import {TargetTile}   from './actor/target.js'
import {Cutscene}     from './cutscene.js'
import {LevelMenu}    from './menu.js'

export const Status = new class {
	static {
		$on('Start End Restore',(_,r)=> Status.#reset(r))
		$on('ChgLevel Spawned', (_,i)=> Status.#setLevel(i))
	}
	#score      = 0
	#highScore  = 0
	#savedScore = 0
	#savedHigh  = 0
	get message()    {return Form.message.value}
	set message(txt) {Form.message.value = txt ?? ''}
	setGameOverMsg() {Form.message.value = 'GAME　　OVER'}
	#reset(restored=false) {
		const highScore = localStorage.anopac_hiscore || 0
		if (Scene.isStart)
			return void Status.#setScore(0)
		restored
			? Status.#setHiScore(highScore)
			: Status.#whenGameEnds(highScore)
		Status.#savedScore = Status.#score
		Status.#savedHigh  = Status.#highScore
		Form.lvsRng.trigger('input')
	}
	#whenGameEnds(highScore) {
		if (Scene.isQuit) {
		    Status.#setScore(Status.#savedScore)
		    Status.#setHiScore(Status.#savedHigh)
		    return
		}
		if (Status.#highScore > highScore) {
			localStorage.anopac_hiscore = Status.#highScore
		}
	}
	#setLevel(lv=Game.level) {
		dFruits.text(null)
		for (let i=max(lv-7, 0); i<lv; i++) {
			makeDiv().css('--o', Fruit.number(i)).appendTo(dFruits)
		}
		Form.levelNum.value = String(lv).padStart(2, 0)
	}
	#setScore(score=0) {
		Form.score.value = (Status.#score=score) || '00'
	}
	#setHiScore(score=0) {
		Form.hiscore.value = (Status.#highScore=score) || '00'
	}
	addScore(pts=0) {
		pts += Status.#score
		if (between(Ctrl.extendVal, Status.#score+1, pts)) {
			Lives.append()
			Sound.play('extend')
			d1UP.addClass('flash')
			setTimeout(_=> d1UP.removeClass('flash'), 2090)
		}
		Status.#setScore(pts)
		if (!Ctrl.isCheatMode && !Ctrl.isPractice)
			(pts > Status.#highScore) && Status.#setHiScore(pts)
	}
}

const Lives = new class {
	static {Form.lvsRng.on('input', _=> Lives.#set())}
	get left() {return +dLives.children.length}
	#set() {
		dLives.text(null)
		integers(Ctrl.livesMax-1).forEach(Lives.append)
	}
	append() {makeDiv().appendTo(dLives)}
	remove() {dLives.lastElementChild?.remove()}
}

export const Game = new class {
	static {$one('load', this.setup)}
	static setup() {
		Game.#initStartBtn()
		Game.#titleScreen()
		$on('keydown',    Game.#keydown)
		$on('ChgLevel',   Game.#resetLevel)
		$on('AteAll',     Game.#ateAll)
		$on('EndDemo',    Game.#end)
		$on('Disappeared',Game.#pacDisappeared)
		.trigger('BoardLoaded')
		dBoard.dataset.loaded = true
	}
	#level     = 1
	#restarted = false
	// Divide the speed equally with level 13+ as the fastest
	get clampedLv() {return clamp(Game.level, 1, 13) || 1}
	get speedByLv() {return 1 - (13-Game.clampedLv) * .01}
	get speedRate() {return Scene.isPlaying? Ctrl.speedRate : 1}
	get interval()  {return Game.speedRate * Ticker.FPeriod}
	get moveSpeed() {return Game.speedRate * Game.speedByLv}
	get restarted() {return Game.#restarted}
	get level()     {return Game.#level}
	#resetLevel()   {return Game.#level = LevelMenu.index+1}
	#setLevel(i=1)  {return Game.#level = between(i, 1, 0xFF) && +i || 1}
	#initStartBtn() {
		Form.startBtn.on('click keydown', Game.#start)
		$on('click', _=> {!dqs(':focus') && Form.startBtn.focus()})
	}
	#keydown(e) {
		if (Confirm.opened)
			return
	 	if (e.ctrlKey && e.key == 'Delete')       return Game.#quit()
		if (Ticker.paused   && Ctrl.dirFrom(e))   return Game.#pause()
		if (Scene.isPlaying && e.key == 'Escape') return Game.#pause()
		if (Scene.isPlaying && e.key == 'Delete') return Game.#confirm()
	}
	#confirm() {
		!Ticker.paused && Game.#pause('')
		Confirm.open('Are you sure you want to quit the game?',
			Game.#quit, _=> Game.#pause(), 'Quit','Resume')
	}
	#pause(state=null, force) {
		if (!Scene.isPlaying || Confirm.opened)
			return
		dBoard.dataset.paused = Ticker.pause(force)
		Status.message = (Ticker.paused && state === null ? 'PAUSED' : state)
		Ticker.paused? Sound.pause() : Sound.resume()
	}
	#titleScreen() {
		Scene.switch('Title')
		Status.setGameOverMsg()
		Cursor.default()
		Form.startBtn.focus()
		dRoot.data({cursor:'always'})
		dBoard.attr('class','ready title')
	}
	#start(e) {
		if (/^key/.test(e.type) && !Ctrl.dirFrom(e))
			return
		Scene.switch('Start')
		dMaze.css('--spd', Ctrl.speedRate)
		dBoard.replaceClass('title','start')
		Cursor.hide()
		LevelMenu.close()
		Status.message = null
		Lives.append()
		Sound.play('start')
		Game.#ready(true)
	}
	#ready(isStart=false) {
		Scene.switch('Ready')
		dBoard.removeClass('respawn')
		function set() {
			Lives.remove()
			dBoard.removeClass('start')
		}
		function go() {
			dBoard.removeAttr('class')
			Scene.switch('Playing')
		}
		Ticker.set(this.#loop)
		Timer.sequence(...[[2200,set],[2000,go]].slice(1^isStart))
	}
	#loop() {
		if (Scene.isPlaying && !document.hasFocus())
			return Game.#pause(null, true)
		Ghost.update()
		Pacman.update()
	}
	#quit() {
		$('#maze .actor, #lost, .pts').hide()
		Scene.switch('Quit', Game.#end)
	}
	#ateAll() {
		Sound.stopLoops()
		Timer.stop().sequence([800,Maze.Door.open], [2350,Game.#end])
	}
	#pacDisappeared() {
		if (Lives.left)
			Game.#end()
		else {
			Status.setGameOverMsg()
			Timer.set(1600, Game.#end)
		}
	}
	#end() {
		dBody.removeAttr('id','class')
		dBoard.dataset.paused = false
		dBoard.dataset.frozen = false
		Ticker.stop() && Sound.stop()
		TargetTile.reset()
		Maze.Door.close()
		$('#maze .actor, .pts').remove()
		Game.#restarted = (Scene.isLostLife && Lives.left > 0)

		if (Scene.isAteAll && Ctrl.consecutive) {
			Game.#setLevel(++Game.#level)
			if (!Ctrl.isPractice && Cutscene.begin())
				return
		}
		const isOver = Scene.isLostLife && Lives.left == 0
		const isQuit = Scene.isQuit || (Scene.isAteAll && !Ctrl.consecutive)
		if (isOver || isQuit || dBoard.hasClass('title')) {
			Game.#resetLevel()
			$trigger('End') && Game.#titleScreen()
		} else {
			Scene.isLostLife && Lives.remove()
			dBoard.addClass('ready','respawn')
			$trigger('Respawn') && Game.#ready()
		}
	}
	showPoint({id,classList,width,height,trPos,left}, {fn,scr=dMaze}={}) {
		const isGhs = Ghost.hasName(id)
		const cls   = classList.item(0)
		const pts   = (isGhs? Ghost : Fruit).points
		const dPts  = makeDiv(`.pts.pts_${cls}`).text(pts).appendTo(scr)

		if (isGhs) {
			Timer.freeze() && (dBoard.dataset.frozen = true)
			trPos.x += (width  - dPts.width) / 2
			trPos.y += (height - dPts.height)/ 2
			trPos.x = clamp(trPos.x, -left, Maze.Width-dPts.width-left)
			dPts.transform(trPos) && Sound.play('bitten')
		}
		Scene.isPlaying && Status.addScore(pts)
		Timer.set((isGhs? 900:1500)/Game.speedRate, _=> {
			dPts.remove()
			dBoard.dataset.frozen = false
			Timer.unfreeze() && isFun(fn) && fn()
		})
		return pts
	}
}

$on('load', _=> {
	byId('loading').remove()
	byId('overlay').addClass('hidden')
})