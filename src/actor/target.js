import {Timer}   from '../../lib/timer.js'
import {Pacman}  from './pacman.js'
import {GhsEnum} from './ghost.js'
import {Maze,TILE as T} from '../maze.js'
export const TargetTile = freeze({
	reset() {$('[id|=trg]').removeAttr('style')},
	translate(idx, {arrived,trPos,isInHouse,isScatter,isFright,isToHouse}, {x, y}) {
		const frozen = (!isToHouse && Timer.frozen)
		if (isToHouse)
			({x, y}=Maze.Door.entrance)
		if (idx == GhsEnum.Guzuta) {
			const {x,y,r}= {...Pacman.tilePos, r:(Circle.width-T)/2}
			const hidden = isInHouse || isScatter || isFright || isToHouse
			Circle.dataset.inside = getDist(trPos,Pacman.trPos) < T*8
			Circle.opacity(frozen || hidden ? 0:1).transform(T*x-r, T*y-r)
		}
		if (idx == GhsEnum.Aosuke && !arrived) return
		Tiles[idx].opacity(frozen || isFright || isInHouse ? 0:.8).transform(T*x, T*y)
	}
}), [Circle, ...Tiles] = dqsAll('[id|=trg]')