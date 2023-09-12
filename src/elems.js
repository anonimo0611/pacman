const SpriteImg = new Image()
SpriteImg.src = 'res/sprite.png'

const dBody = document.body
const [dBoard,dMaze,dFruit,dFruits,dLives,d1UP,dSize,dCfgP,dKeys,dCB]=
	byIds('board|maze|fruit|fruits|lives|oneUP|size|cfgPanel|keysPanel|CB')