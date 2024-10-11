import {Sound}         from '../snd/sound.js'
import {Timer}         from '../lib/timer.js'
import {Dir,U,L,D,R,C} from '../lib/direction.js'
import {Form}          from './control.js'
import {Status,Game}   from './main.js'

const MAP_DATA = `\
############################
############################
#............##............#
#.####.#####.##.#####.####.#
#O#  #.#   #.##.#   #.#  #O#
#.####.#####.##.#####.####.#
#..........................#
#.####.##.########.##.####.#
#.####.##.########.##.####.#
#......##....##....##......#
######.##### ## #####.######
     #.##### ## #####.#     
     #.##    A     ##.#     
     #.## ###--### ##.#     
######.## #      # ##.######
      .   #a P  G#   .      
######.## #      # ##.######
     #.## ######## ##.#     
     #.##    F     ##.#     
     #.## ######## ##.#     
######.## ######## ##.######
#............##............#
#.####.#####.##.#####.####.#
#.####.#####.##.#####.####.#
#O..##.......> .......##..O#
###.##.##.########.##.##.###
###.##.##.########.##.##.###
#......##....##....##......#
#.##########.##.##########.#
#.##########.##.##########.#
#..........................#
############################
############################
############################`

export const TILE = dRoot.fontSize()|0
export const Maze = new class _Maze {
	Door = {
		y:13, centerX:13.5, entrance:{y:12, x:13},
		open()  {dBoard.dataset.door = 'open' },
		close() {dBoard.dataset.door = 'close'},
	}
	Tunnel = {
		y:15, entranceL:4, entranceR:23,
		side({y=0, x=0}={}) {
			if (y == this.y && x <= this.entranceL) return L
			if (y == this.y && x >= this.entranceR) return R
			return null
		}
	}
	GhsNoEntrySet = new Set(['12-11','15-11','12-23','15-23']) // x-y
	GhsScatterPos = {
		Pinky: {y: 0, x: 3}, Akabei: {y: 0, x:24},
		Guzuta:{y:33, x: 0}, Aosuke: {y:33, x:27},
	}
	getGhsExitPos({y:gy, x:gx}, {y, x}) {
		return (y < 10 && between(gy, 12,18) && between(gx, 9,13))
			? {y:15, x:6} : {y, x}
	}
	isInHouse  = ({y, x})=> between(y, 13,17) && between(x, 10,17)
	isInTunnel = ({y, x})=> Maze.Tunnel.side({y, x}) != null

	#Tiles    = [];
	TileSize  = TILE
	Lines     = MAP_DATA.split('\n')
	DotMax    = MAP_DATA.match(/[.O]/g).length
	dGrid     = makeElm('div#mazeGrid')
	ColMax    = this.Lines[0].length
	Width     = (this.ColMax)   * TILE
	Center    = (this.Width/2)  - TILE/2 + .5
	PenMiddle = (this.Door.y+2) * TILE
	PenTop    = (this.PenMiddle)- TILE/2
	PenBottom = (this.PenMiddle)+ TILE/2

	#dotsLeft = this.DotMax
	get dotsLeft() {return this.#dotsLeft}

	static {$one('DOMContentLoaded', this.setup)}
	static setup() {
		$on('Respawn End', _Maze.spawnObjs)
		$on('DotEaten', _=> Maze.#dotsLeft--)
		Form.powChk.on('change', Maze.#powDotsToggle)
		Maze.dGrid.prependTo(dMaze)
		Maze.Lines.forEach((line, y)=> {
			Array.from(line).forEach((maptip, x)=> {
				const [tile,dx,dy]= [makeDiv(),TILE*x,TILE*y]
				const [hasDoor,hasWall]=[(maptip == '-'), /[#-]/.test(maptip)]
				Maze.#Tiles.push(tile)
				maptip == 'O' && (tile.dataset.role = 'pow')
				tile.readOnly({x,y,dx,dy,hasDoor,hasWall}).appendTo(Maze.dGrid)
			});
		});_Maze.spawnObjs()
	}
	static spawnObjs() {
		const objs = Maze.#Tiles.map(e=> [_Maze.makeObj(e), e])
		for (const [o,tile] of objs) {
			if (!o) continue;
			o.setPos(tile).addClass(o.id,'actor').appendTo(dMaze)
			o.x < int(Maze.Door.centerX) && (o.initAlign = L)
			o.x > int(Maze.Door.centerX) && (o.initAlign = R)
			const t2 = TILE*2, {id,initAlign = C}= o
			o.transform(Maze.Center+{[L]:-t2,[R]:t2,[C]:0}[initAlign], tile.top)
			o.readOnly({id,initAlign, initX:o.x, initTrX:o.trX})
		}
		$trigger('Spawned')
		if (!Game.restarted) {
			$trigger('NewLevel')
			Maze.#dotsLeft = Maze.DotMax
			Form.powChk.trigger('change')
		}
	}
	static makeObj(tile) {
		switch (Maze.Lines[tile.y][tile.x]) {
		case 'F': return $(dFruit).css('--o', Fruit.number()).show()[0]
		case '>': return makeDiv('#Pacman')
		case 'A': return makeDiv('#Akabei.ghs').data({orient:L})
		case 'P': return makeDiv('#Pinky .ghs').data({orient:D})
		case 'a': return makeDiv('#Aosuke.ghs').data({orient:U})
		case 'G': return makeDiv('#Guzuta.ghs').data({orient:U})
		case '.': !Game.restarted && tile.prop({hasDot:true}).data({dot:'normal'})
		}
	}
	getTile({y=0, x=0}={}) {
		return Maze.#Tiles[y*Maze.ColMax+x] || null;
	}
	adjacent(dir, {y=0, x=0}={}) {
		return Dir.isValid(dir)
			&& ({y, x}=Dir.toVec2(dir, 1, {y, x}))
			&& Maze.getTile({y, x:(x+Maze.ColMax) % Maze.ColMax})
				|| null
	}
	loopX({width,trPos,left=0}) {
		if (trPos.x < -width-left) trPos.x = Maze.Width-left
		if (trPos.x > Maze.Width-left) trPos.x = -width-left
		return trPos
	}
	#powDotsToggle() {
		for (const tile of Maze.dGrid.find('[data-role=pow]'))
			tile.prop({hasDot:true}).data({dot:this.checked? 'pow':'normal'})
	}
}; deepFreeze(Maze)

export const Fruit = new class {
	static {
		$on('Title',   _=> Fruit.#visible(true))
		$on('Ready',   _=> Fruit.#visible(false))
		$on('DotEaten',_=> Fruit.#dotEaten())
	}
	#fruitList = freeze([0,1,2,2,3,3,4,4,5,5,6,6,7])
	#pointList = freeze([100,300,500,700,1e3,2e3,3e3,5e3])
	#appearSet = new Set([70,170]) // Fruit appear after 70 or 170 dots are cleared
	get points()   {return Fruit.#pointList[Fruit.number()]}
	number(index)  {return Fruit.#fruitList[min(12,index ?? Game.level-1) || 0]}
	#visible(bool) {return dFruit.opacity(bool).prop({hidden:!bool})}
	#dotEaten() {
		if (!Fruit.#appearSet.has(Maze.DotMax - Maze.dotsLeft))
			return
		Fruit.#visible(true)
		Timer.set(randInt(9e3, 1e4 - 300)/Game.speedRate,
			_=> dFruit.opacity(0, 300/Game.speedRate), {key:Fruit})
	}
	collision({x, y}) {
		if (!dFruit.circleCollision({x, y}, dFruit.width/4))
			return
		Timer.cancel(Fruit) && Sound.play('fruit')
		Game.showPoint(Fruit.#visible(false))
	}
}