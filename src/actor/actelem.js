import {GhsNames} from './ghost.js'
export let [dPac,dAka,GhsElms]= [makeDiv(),makeDiv(),byIds()]

$on('Spawned Demo Cutscene', e=> {
	if (e.type != 'Spawned')
		$('#maze .actor').remove();
	GhsElms = freeze(byIds(GhsNames));
	[dPac,dAka]= byIds(`Pacman|${GhsNames[0]}`);
})