import {Sound}         from '../../snd/sound.js'
import {Dir,U,L,D,R,C} from '../../lib/direction.js'
import {Ticker,Timer}  from '../../lib/timer.js'
import {dBoard}        from '../elems.js'
import {Status,Game}   from '../main.js'
import {Scene}         from '../scene.js'
import {Ctrl}          from '../control.js'
import {Maze}          from '../maze.js'
import {Speed}         from './speed.js'
import {GhsElms,dAka}  from './actelem.js'
import {Pacman as Pac} from './pacman.js'
import {TargetTile}    from './target.js'

export const GhsEnum  = freeze({Akabei:0,Pinky:1,Aosuke:2,Guzuta:3,Max:4})
export const GhsNames = freeze(keys(GhsEnum).slice(0,-1))

const {loopX,Door,Tunnel,GhsScatterPos,adjacent:adj,TileSize:T}= Maze

const SysMap   = new Map()
const Dirs     = freeze([U,L,D,R])
const WaveType = freeze({Scatter:0,Chase:1})

const releaseTime = idx=> ({ // For always chase mode (ms)
	// Pinky->Aosuke->Guzuta
	 0:[1000,  500,  500], // <-After life is lost
	 1:[1000, 4000, 4000], 2:[800, 2200, 4000], 3:[600, 1900, 3500],
	 4:[ 600, 1900, 1500], 5:[500, 1300, 1200], 6:[500, 1300, 1200],
	 7:[ 300,  700,  800], 8:[300,  700,  800], 9:[200,  800,  200],
	10:[ 200,  800,  200],11:[100,  700,  200],12:[100,  700,  200],
	13:[   0,  900,    0]}[Game.restarted? 0 : Game.clampedLv][idx])

const notEnter = (dir, {x, y})=>
	!Ctrl.unrestricted && dir == U && Maze.GhsNoEntrySet.has(`${x}-${y}`)

const compareDist = (a, b)=>
	a.dist == b.dist ? a.index-b.index : a.dist-b.dist

const Waves = new class { // Alternate between scatter and chase modes
	#mode = WaveType.Scatter;
	get isChase()   {return this.#mode == WaveType.Chase}
	get isScatter() {return this.#mode == WaveType.Scatter && !Ctrl.isChaseMode}
	set(lv=Game.level) {
		const TimeList = [ // ms
			lv <= 4 ? 4500 : 3500, 
			15e3,
			lv <= 4 ? 4500 : 3500,
			15e3,
			3500,
			lv == 1 ? 15e3 : 78e4,
			lv == 1 ? 3500 :16.66,
			Infinity,
		]
		let [timeCnt, idx] = [-1, 0]
		function update() {
			if (Ghost.frightened || Timer.frozen)
				return
			if (Game.interval * ++timeCnt < TimeList[idx])
				return
			[timeCnt, Waves.#mode] = [0, ++idx % 2];
			Waves.setReversalSig()
		}
		Waves.#mode = WaveType.Scatter;
		SysMap.set(Waves, {update})
	}
	setReversalSig() {
		GhsElms.forEach(g=> {
			if (FrightMode.time == 0)
				g.trigger('Runaway')
			if (!(g.isToHouse && g.isInHouse))
				g.prop({nextTile:null,revSig:true})
		})
	}
}

export class FrightMode {
	static #timeList = freeze([6,5,4,3,2,5,2,2,1,5,2,1,0]) // seconds
	static get time() {return this.#timeList[Game.clampedLv-1]*1e3}
	#timeCnt    = 0
	#captureCnt = 0
	#flashedCnt = int(!Scene.isDemo && FrightMode.time <= 2e3)
	get points() {return 2 ** this.#captureCnt * 100}
	get allCaptured() {return this.#captureCnt == GhsEnum.Max}
	constructor() {
		$(GhsElms).offon('Bitten', _=> ++this.#captureCnt)
		SysMap.set(FrightMode, this.#toggleMode(true))
	}
	update() {
		if (Timer.frozen)
			return
		const elapsedTime = Game.interval * this.#timeCnt++
		if (elapsedTime >= FrightMode.time-2e3 && !this.#flashedCnt++)
			this.#setFlash(true)
		if (elapsedTime >= FrightMode.time || this.allCaptured)
			this.#toggleMode(false)
	}
	#toggleMode(bool) {
		SysMap.delete(FrightMode)
		bool? Sound.playFright()
		    : Sound.playSiren()
		this.#setFlash(bool? this.#flashedCnt : 0).forEach(g=>
			!g.isToHouse && g.toggleClass('fright', bool).prop({isFright:bool})
		)
		return this
	}
	#setFlash = bool=> GhsElms.map(g=> g.toggleClass('flash', !!bool))
}

const Elroy = new class { // "Akabei" accelerate three times in each level
	#part=0; #rates = freeze([1, 1.02, 1.05, 1.1])
	#dotsLeftP2List = freeze([20,20,30,40,50,60,70,70,80,90,100,110,120])
	get part() {return this.#part}
	get rate() {return this.#rates[this.part]}
	dotEaten() {
		const elroyP2 = this.#dotsLeftP2List[Game.clampedLv-1]
		const speedUp = _=> {++this.#part,Sound.playSiren()}
		if (Maze.dotsLeft <= elroyP2*([15,10,50][this.part]/10))
			speedUp()
	}
	reset() {if (!Game.restarted) this.#part = 0}
}

const DotCounter = new class {
	#globalCnt = -1
	#counters  = new Uint8Array(GhsEnum.Max) // personal dot counters
	#limitList = [[7, 0,0,0],[17, 30,0,0],[32, 60,50,0]] // Pinky,Aosuke,Guzuta
	release(i, fn) { // parameter 'i' is the ghost index
		const gLimit = this.#limitList[i-1][0] // global limit
		const pLimit = this.#limitList[i-1][min(Game.level,3)] // personal limit
		const timeOutLimit = (Game.level <= 4 ? 4e3 : 3e3)
		if (Pac.timeToStopEating >= timeOutLimit)
			fn()
		else (!Game.restarted || this.#globalCnt < 0)
			? this.#counters[i] >= pLimit && fn()
			: this.#globalCnt   == gLimit && fn(i == GhsEnum.Guzuta)
				&& (this.#globalCnt = -1)
	}
	add() {
		(Game.restarted && this.#globalCnt >= 0)
			? this.#globalCnt++
			: this.#counters[GhsElms.findIndex(g=> g.isIdle)]++
	}
	reset() {
		!Game.restarted && this.#counters.fill(0)
		this.#globalCnt = Game.restarted? 0 : -1
	}
}

export class Ghost {
	static {
		$on('Spawned', this.#reset)
		$on('Playing', this.#init)
		$on('DotEaten',this.#dotEaten)
	}
	static active  = true // for debug
	static #symbol = Symbol()
	static get eloryPart()  {return Elroy.part}
	static get baseSpeed()  {return Game.moveSpeed * Speed.GhsBase}
	static get frightened() {return SysMap.has(FrightMode)}
	static get points()     {return SysMap.get(FrightMode)?.points|0 || 0}
	static hasName(ghsName) {return GhsNames.includes(ghsName)}
	static #init() {
		if (!Ghost.active)
			return
		dBoard.data({frightTime:FrightMode.time}) && Sound.playSiren()
		GhsNames.forEach((_,i)=> new Ghost(Ghost.#symbol, i))
		Ctrl.isChaseMode
			? Ghost.#setReleaseTimer()
			: Waves.set(Game.level)
	}
	static #setReleaseTimer() { // For always chase mode
		Timer.sequence(...GhsElms.slice(1).map((g, i)=>
			[releaseTime(i)/Game.speedRate, _=> SysMap.get(g.id).#release()]))
	}
	static #reset() {
		SysMap.clear()
		;[Elroy,DotCounter].forEach(o=> o.reset())
	}
	static #dotEaten(_, isPow) {
		if (!Ghost.active)
			return
		DotCounter.add()
		Elroy.dotEaten()
		isPow && Waves.setReversalSig()
		isPow && FrightMode.time && (new FrightMode)
	}
	static update() {
		SysMap.forEach(i=> Scene.isPlaying && i.update())
	}
	#runAway = -1
	constructor(symbol, index=0) {
		if (symbol != Ghost.#symbol)
			throw TypeError(`The constructor ${this.constructor.name}() is not visible`)

		const g = this.g = GhsElms[this.index = index]
		initFlags(g, 'Idle|GoOut|InHouse|LeftHouse|Scatter|Fright|ToHouse|InTunnel')
			.prop({isIdle:!this.isAka, started:this.isAka, arrived:true, revSig:false})
			.on('Runaway', _=> this.#runAway=400/Game.interval)

		SysMap.set(GhsNames[index], freeze(this))
	}
	set #orient(dir) {Dir.isValid(dir) && (this.g.dataset.orient = dir)}
	get #orient()  {return this.g.dataset.orient}
	get isAka()    {return this.g == dAka}
	get angry()    {return this.isAka && Elroy.part > 1 && GhsElms.at(-1).started}
	get tilePos()  {return vecDivInt(this.g.ctPos, T)}
	get opposite() {return Dir.opposite(this.#orient)}

	#isScatter  = g=> Waves.isScatter && !g.isFright && !g.isToHouse && !this.angry
	#showTarget = g=> TargetTile.translate(this.index, g, this.#targetPos)

	update() {
		const {g}= this
		g.isScatter  = this.#isScatter(g)
		g.isInHouse  = Maze.isInHouse(g)
		g.isInTunnel = Maze.isInTunnel(g)
		Ctrl.showTargets && this.#showTarget(g)

		if (Timer.frozen && !g.isToHouse || this.#collision())
			return
		if (this.#runAway >= 0)
			this.#runAway--

		if (g.isIdle)  return void this.#bounceAtHouse()
		if (g.isGoOut) return void this.#leaveHouse()
		if (g.arrived || g.isLeftHouse) this.#setNext()
		this.#move(g.destTile)
	}
	#bounceAtHouse() {
		const {g,index}= this
		if (!Ctrl.isChaseMode)
			DotCounter.release(index, this.#release.bind(this))

		if (g.isGoOut) return
		this.#orient = (g.trY > Maze.PenTop && this.#orient != D)
			? U : (g.trY < Maze.PenBottom ? D : U)
		g.moveByDir(this.#orient, this.speed).isToHouse = false
	}
	#release(deactivateGlobalDotCnt=false) {
		Pac.resetTimer()
		this.g.prop({isIdle:false,isGoOut:true})
		return deactivateGlobalDotCnt
	}
	#leaveHouse() {
		const {g,speed:step}= this
		if (g.trX < Maze.Center-step ||
			g.trX > Maze.Center+step)
			g.moveByDir(this.#orient=Dir.opposite(g.initAlign), step)
		else if (g.trX != Maze.Center)
			g.transform(Maze.Center)
		else (g.trY > Door.entrance.y*T+step)
			? g.moveByDir(this.#orient=U, step)
			: g.setPos(Door.entrance).prop({isGoOut:false,isLeftHouse:true})
				&& (this.#orient=L) && (g.started ||= true)
		g.isToHouse = false
	}
	#setNext() {
		this.g.destTile = this.g.nextTile ?? this.#decideNext()
		this.g.revSig && (this.g.destTile  = this.#reverse())
		this.g.arrived  = this.g.isLeftHouse = false
		this.g.movDir   = this.#orient
		this.g.nextTile = this.#decideNext(true)
		this.g.dataset.angry = this.angry
	}
	#reverse() {
		const {g}= this
		if (g.isLeftHouse)
			return Maze.getTile(g)
		this.#orient = Dir.opposite(g.movDir || this.#orient)
		return adj(this.#orient, g.prop({revSig:g.isInHouse}))
	}
	#decideNext(isPre) {
		const {g}= this
		if (isPre)
			g.setPos(g.destTile)
		if (isPre && g.isInHouse)
			return null
		return !g.isToHouse
			? this.#getNextTile()
			: this.#getTileClosestToHouse()
	}
	#getNextTile(target=this.#targetPos) {
		const {g,opposite:opp}= this
		const dirs = Dirs.filter(dir=> dir != opp && !adj(dir, g).hasWall)
		if (g.isLeftHouse || g.isFright) {
			const dir = g.isLeftHouse? L : randChoice(dirs)
			return adj(this.#orient=dir, g)
		}
		const trg = Maze.getGhsExitPos(this.tilePos, target)
		const dir = dirs.flatMap((dir, index)=> {
			const tile = adj(dir,g)
			const dist = getDist(tile,trg)
			return !g.isToHouse && notEnter(dir,tile) ? []:{dir,index,dist}
		}).sort(compareDist).at(this.#runAway < 0 ? 0 : -1).dir
		return adj(this.#orient=dir, g)
	}
	#getTileClosestToHouse() {
		const {g}= this
		if (!g.isInHouse && !adj(D, g).hasDoor)
			return this.#getNextTile(Door.entrance)
		if (g.y != Door.y+3)
			return adj(this.#orient=D, g)
		if (g.initAlign == C || g.x == g.initX) {
			(this.isAka || Ctrl.isChaseMode)
				? (g.isGoOut=true)
				: (g.isIdle =true)
			g.removeClass('toHouse') && Sound.ghsArrivedHome()
			return Maze.getTile(g)
		}
		return adj(this.#orient=g.initAlign, g)
	}
	get #targetPos() {
		const {id,trPos,isScatter}= this.g
		if (isScatter)
			return GhsScatterPos[id]
		let {x, y}= Pac.tilePos
		switch (this.index) {
		case GhsEnum.Pinky:
			setForwardPos(4)
			Tunnel.side(Pac.tilePos) == L && Pac.dir == L && (x=Tunnel.entranceR)
			Tunnel.side(Pac.tilePos) == R && Pac.dir == R && (x=Tunnel.entranceL)
			break
		case GhsEnum.Aosuke:
			setForwardPos(2)
			x += x - dAka.x
			y += y - dAka.y
			break
		case GhsEnum.Guzuta:
			getDist(trPos, Pac.trPos) < T*8 && ({x, y}=GhsScatterPos[id])
		}
		function setForwardPos(num) {
			({x, y}=Dir.toVec2(Pac.dir, num, {x, y}))
			if (Pac.dir == U) x -= num
		}
		return {x, y}
	}
	get speed() {
		const spd = Ghost.baseSpeed * (this.isAka && Elroy.rate || 1)
		if (this.g.isToHouse)  return Game.speedRate  * Speed.GhsToHouse
		if (this.g.isInHouse)  return Ghost.baseSpeed * Speed.Step/2
		if (this.g.isInTunnel) return Ghost.baseSpeed * Speed.GhsInTunnel
		if (this.g.isFright)   return Ghost.baseSpeed * Speed.GhsFrightened
		return this.g.isScatter? Ghost.baseSpeed : spd
	}
	#move({dx,dy}) {
		const {g}= this, mv = Dir.toVec2(g.movDir, Speed.Step * this.speed)
		g.isInHouse && mv.y && (dy = Maze.PenBottom)
		g.isInHouse && mv.x && (dx = g.initTrX)
		if (abs(g.x - Door.centerX) < 1 && this.#orient == D)
			dx = Maze.Center
		if (abs(mv.x? dx-g.trX : dy-g.trY) <= mv.step) {
			g.arrived = true
			if (this.#orient != g.movDir || dx != g.destTile.dx)
				return void g.transform(mv.x? {x:dx}:{y:dy})
		}
		g.moveByDir(g.movDir, mv.step).trPos = loopX(g)
	}
	#collision(r=T/(this.g.isFright ? 2 : 5)) {
		const {g}= this
		if (g.isToHouse || g.isGoOut)
			return false
		if (!g.circleCollision(Pac.trPos, r))
			return false
		if (g.isFright) {
			g.revSig = g.isFright = false
			g.trigger('Bitten').replaceClass('fright','bitten')
			Game.showPoint(g, {fn:_=>this.#setReturnToHouse()})
		} else {
			if (Ctrl.invincible || !Maze.dotsLeft)
				return false
			Scene.switch('LostLife', Sound.stop)
		}
		return true
	}
	#setReturnToHouse() {
		Sound.ghsReturnToHouse()
		this.g.replaceClass('bitten','toHouse').isToHouse = true
	}
} freeze(Ghost)