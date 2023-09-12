import {Maze} from '../maze.js'
export const Speed = freeze({
	PacEating:    0.86,
	PacEnergized: 1.10,
	PacSlowBase:  0.95,
	GhsBase:      1.02,
	GhsToHouse:   1.40,
	GhsInTunnel:  0.60,
	GhsFrightened:0.65,
	Step: +(Maze.TileSize/4.5).toFixed(1)
})