import {Sound}        from '../../snd/sound.js'
import {Confirm}      from '../../lib/confirm.js'
import {Dir,L,R}      from '../../lib/direction.js'
import {Ticker,Timer} from '../../lib/timer.js'
import {Game,Status}  from '../main.js'
import {Scene}        from '../scene.js'
import {Ctrl}         from '../control.js'
import {Maze,Fruit}   from '../maze.js'
import {dPac as pac}  from './actelem.js'
import {Disappear}    from './disappear.js'
import {Ghost}        from './ghost.js'
import {Speed}        from './speed.js'

const {Tunnel,loopX,getTile,adjacent:adj,TileSize:T}= Maze

let eatIndex  = -1
let notEatCnt = +0

export const Pacman = new class {
	static {
		$on('keydown', e=> Pacman.#keydown(e))
		$on('Playing', _=> Pacman.#init())
		$on('LostLife',_=> Pacman.#lostLife(pac))
	}
	resetTimer()  {notEatCnt = 0}
	get dir()     {return pac.movDir}
	get trPos()   {return pac.trPos}
	get tilePos() {return vecDivInt(pac.ctPos, T)}
	get timeToStopEating() {return notEatCnt * Game.interval}
	#init() {
		this.resetTimer()
		eatIndex    = -1
		pac.arrived = true
		pac.turning = false
		pac.movDir  = (pac.orient ??= L)
		pac.setPos({x:pac.initX+int(pac.movDir == R)})
	}
	#keydown(e) {
		const dir = Dir.from(e.code, {awsd:true})
		if (Confirm.opened || !dir || e.originalEvent.repeat)
			return
		if (Scene.isPlaying && dir == pac.preDir)
			return
		if (Scene.isReady) pac.preDir = dir
		if (Scene.some('Ready|Playing'))
			adj(dir,pac).hasWall
				? (pac.preDir=dir)
			    : !pac.turning && (pac.orient=dir)
	}
	get #moveVector() {
		let spd = Game.moveSpeed
			* (Game.level < 13 ? 1 : Speed.PacSlowBase)
		if (eatIndex >= 0)    spd *= Speed.PacEating
		if (Ghost.frightened) spd *= Speed.PacEnergized
		return Dir.toVec2(pac.movDir,Speed.Step*spd)
	}
	#getState({orient,trPos:ov,dstTile:dest}, {dx,dy}=dest) {
		const {step,opposite:opp,x:mx,y:my}= this.#moveVector
		return freeze({
			dest,dx,dy,mx,my,ov,step,opp,
			dotType:   dest.dataset.dot,
			turnedBack:orient == opp,
			blocked:   adj(orient, dest).hasWall,
			distance:  abs(mx? dx-ov.x : dy-ov.y),
		})
	}
	update() {
		if (!Scene.isPlaying || Timer.frozen)
			return
		if (eatIndex < 0)
			notEatCnt++
		if (pac.arrived) {
			const dst = adj(pac.orient,pac)
			if (!dst.hasWall) this.#setNext(dst)
			else return void (pac.preDir=null, eatIndex=-1)
		}
		const state = this.#getState(pac)
		this.#eatDot(state)
		this.#changeDir(state)
		this.#move(state)
		Fruit.collision(pac.trPos)
	}
	#setNext(dst) {
		pac.arrived = false
		pac.lstTile = getTile(pac)
		pac.dstTile = pac.dstTile? dst : (dst=pac.lstTile)
		pac.movDir  = pac.orient
		dst.hasDot == false && (eatIndex=-1)
		pac.data({stopped:false}).setPos(dst)
	}
	#changeDir(s) {
		if (s.turnedBack) pac.prop({orient:s.opp, preDir:null})
		else this.#setTurn(s.distance < T/2+s.step)
			? (pac.trPos = Dir.toVec2(pac.orient, s.step, s.ov))
			: (pac.trPos = s.mx? {y:s.dy}:{x:s.dx})
				&& this.#setPostTurn(!s.blocked && s.distance >= T/2, s.opp)
	}
	#canTurn = tile=> adj(pac.preDir, tile)?.hasWall === false
	#setTurn(reached) {
		if (reached && this.#canTurn(pac.dstTile))
			pac.prop({orient:pac.preDir, preDir:null})
		return pac.turning = (pac.orient != pac.movDir)
	}
	#setPostTurn(reached, opposite) {
		if (reached && this.#canTurn(pac.lstTile))
			pac.prop({arrived:true, orient:opposite})
	}
	#move(s) {
		if (s.turnedBack || s.distance <= s.step) {
			pac.arrived = true
			const nv = s.mx? {x:s.dx}:{y:s.dy}
			if (s.turnedBack) pac.movDir = pac.orient
			if (s.blocked && !pac.turning) {pac.dataset.stopped=true}
			if (s.blocked ||  pac.turning) {pac.transform(nv);return}
		}
		pac.moveByDir(pac.movDir, s.step, pac.orient).trPos = loopX(pac)
	}
	#eatDot(s) {
		if (!s.dest.hasDot || s.distance >= T/2+s.step)
			return
		this.#playSE()
		this.resetTimer()
		$trigger('DotEaten', s.dotType == 'pow')
		Status.addScore({normal:10,pow:50}[s.dotType])
		s.dest.data({dot:'eaten'}).hasDot = false
		Maze.dotsLeft == 0 && Scene.switch('AteAll')
	}
	#playSE() {
		const duration = (20/Game.speedByLv)/(Ctrl.speedRate/1.5)+.5|0
		Sound.play(`eat${eatIndex = ++eatIndex % 2}`, {duration})
	}
	#lostLife({trX:x,width,pos}) {
		if (pos.y == Tunnel.y) x = clamp(x, width/2, Maze.Width-width)
		Timer.stop().sequence(
			[ 300, _=> pac.transform(x).addClass('prep','lost')],
			[ 700, _=> new Disappear(pac, {...pac.trPos,Sound})],
			[2210, _=> $trigger('Disappeared')]
		)
	}
}