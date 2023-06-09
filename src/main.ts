import Phaser from 'phaser'

import SnakeScene from './SnakeScene'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	parent: 'app',
	width: 800,
	height: 600,
	physics: {
		default: 'arcade'
	},
	scene: [SnakeScene],
}

export default new Phaser.Game(config)
