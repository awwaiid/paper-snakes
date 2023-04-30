import Phaser from 'phaser';

class Snake {
  private head: Phaser.GameObjects.Sprite;
  private headShadow: Phaser.GameObjects.Sprite;
  private body: Phaser.GameObjects.Group;
  private bodyShadow: Phaser.GameObjects.Group;
  private scene: Phaser.Scene;
  private direction: Phaser.Math.Vector2;
  private lastMoveTime: number;
  private moveDelay: number;
  private isJumping: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;

    this.moveDelay = 150; // Time (in milliseconds) between each movement step
    this.lastMoveTime = 0; // The last time (in milliseconds) the snake moved

    this.direction = new Phaser.Math.Vector2(1, 0);

    this.head = this.scene.add.sprite(x, y, 'snakeBody');
    this.headShadow = this.scene.add.sprite(x, y, 'snakeBody');
    this.headShadow.setTintFill(0xff0000); // Set the tint to black
    this.headShadow.setAlpha(0.5); // Set the alpha to 0.5 (50% transparency)
    this.headShadow.setDepth(-1); // Set the depth lower than the segments
    this.headShadow.setVisible(0);


    this.body = this.scene.add.group();
    this.bodyShadow = this.scene.add.group();
    this.isJumping = 0;
  }

  setIsJumping(z: number) {
    this.isJumping = z;
  }

  update(time: number) {
    if (time >= this.lastMoveTime + this.moveDelay) {
      // Save the old head position before moving
      const oldHeadPos = new Phaser.Math.Vector2(this.head.x, this.head.y);

      // Update the head's position based on the current direction
      this.head.x += this.direction.x * 50;
      this.head.y += this.direction.y * 50;
      this.head.rotation = Math.atan2(-1 * this.direction.y, -1*this.direction.x);

      this.headShadow.setRotation(this.head.rotation);
      this.headShadow.setPosition(this.head.x + 10, this.head.y + 10);
      this.headShadow.setVisible(this.isJumping);

      // Move the body segments
      this.updateBodyPositions(oldHeadPos, this.isJumping);

      // Update the last move time
      this.lastMoveTime = time;
    }
  }

  grow() {
    // const newSegment = this.scene.add.sprite(this.tail.x, this.tail.y, 'body');

    // const segmentFrame = Math.floor(Math.random() * 16);
    const segmentFrame = (this.body.getLength() + 1) % 16;
    const newSegment = this.scene.add.sprite(0, 0, 'snakeBody', segmentFrame);

    newSegment.setData('isJumping', 0);
    newSegment.setVisible(0);
    this.body.add(newSegment);

    const shadow = this.scene.add.sprite(0, 0, 'snakeBody', segmentFrame);
    shadow.setTintFill(0xff0000); // Set the tint to black
    shadow.setAlpha(0.5); // Set the alpha to 0.5 (50% transparency)
    shadow.setDepth(-1); // Set the depth lower than the segments
    shadow.setVisible(0);
    this.bodyShadow.add(shadow);

  }

  collideWithSelf() {
    let isColliding = false;

    this.body.children.each((segment) => {
      const sprite = segment as Phaser.GameObjects.Sprite;

      if (this.isJumping === sprite.getData('isJumping') && this.head.getBounds().contains(sprite.x, sprite.y)) {
        isColliding = true;
        return;
      }
    });

    return isColliding;
  }

  isOutOfBounds(width: number, height: number) {
    return (
      this.head.x < 0 ||
      this.head.y < 0 ||
      this.head.x >= width ||
      this.head.y >= height
    );
  }

  updateBodyPositions(oldHeadPos: Phaser.Math.Vector2, oldHeadIsJumping: number) {
    if (this.body.getLength() > 0) {
      const firstSegment = this.body.getFirst(true) as Phaser.GameObjects.Sprite;
      const oldSegmentPos = new Phaser.Math.Vector2(firstSegment.x, firstSegment.y);
      let oldSegmentIsJumping = firstSegment.getData('isJumping');

      // firstSegment.rotation = Math.atan2(oldHeadPos.y - firstSegment.y, oldHeadPos.x - firstSegment.x);
      firstSegment.rotation = Math.atan2(-1 * (oldHeadPos.y - firstSegment.y), -1 * (oldHeadPos.x - firstSegment.x));
      firstSegment.setData('isJumping', oldHeadIsJumping);
      firstSegment.setPosition(oldHeadPos.x, oldHeadPos.y);
      firstSegment.setVisible(1);

      const firstSegmentShadow = this.bodyShadow.getFirst(true) as Phaser.GameObjects.Sprite;
      firstSegmentShadow.setPosition(firstSegment.x + 10, firstSegment.y + 10);
      firstSegmentShadow.setVisible(firstSegment.getData('isJumping'));
      firstSegmentShadow.setRotation(firstSegment.rotation);

      this.body.children.each((segment, index) => {
        if (index > 0) {
          const sprite = segment as Phaser.GameObjects.Sprite;
          const temp = new Phaser.Math.Vector2(sprite.x, sprite.y);

          sprite.rotation = Math.atan2(-1 * (oldSegmentPos.y - sprite.y), -1 * (oldSegmentPos.x - sprite.x));
          sprite.setPosition(oldSegmentPos.x, oldSegmentPos.y);
          sprite.setVisible(1);
          oldSegmentPos.copy(temp);

          const isJumping = sprite.getData('isJumping');
          sprite.setData('isJumping', oldSegmentIsJumping);
          oldSegmentIsJumping = isJumping;

          const spriteShadow = this.bodyShadow.getChildren()[index] as Phaser.GameObjects.Sprite;
          spriteShadow.setPosition(sprite.x + 10, sprite.y + 10);
          spriteShadow.setVisible(sprite.getData('isJumping'));
          spriteShadow.setRotation(sprite.rotation);
        }
      });
    }
  }

  setDirection(newDirection: Phaser.Math.Vector2) {
    // Prevent the snake from moving in the opposite direction
    if (this.direction.clone().negate().equals(newDirection)) {
      return;
    }

    this.direction = newDirection;
  }
}




export default class HelloWorldScene extends Phaser.Scene {

  snake: Snake;
  private debugText: Phaser.GameObjects.Text;

	constructor() {
		super('hello-world');
	}

	preload() {
		// this.load.setBaseURL('https://labs.phaser.io')

		// this.load.image('sky', 'assets/skies/space3.png')
		// this.load.image('logo', 'assets/sprites/phaser3-logo.png')
		// this.load.image('red', 'assets/particles/red.png')
		this.load.spritesheet('snakeBody', '/snake-body.png', {
      frameWidth: 50,
      frameHeight: 50
    });
	}

	create() {
		// this.add.image(400, 300, 'sky')

		// const particles = this.add.particles('red')

		// const emitter = particles.createEmitter({
		// 	speed: 100,
		// 	scale: { start: 1, end: 0 },
		// 	blendMode: 'ADD',
		// })

		// const logo = this.physics.add.image(400, 100, 'logo')

		// logo.setVelocity(100, 10)
		// logo.setBounce(1, 1)
		// logo.setCollideWorldBounds(true)
    //
		// emitter.startFollow(logo)
    this.cameras.main.setBackgroundColor('#4488AA');

		// const snakeSegment = this.add.sprite(100, 100, 'snakeBody', 0);
    // snake.setVelocity(0, 20)
		// snake.setCollideWorldBounds(true)
    //
    // const snakeSprite = this.physics.add.sprite(20, 20, 'snake');
    // const snakeSprite = new Sprite(this, 20, 20, 'snake');

    this.snake = new Snake(this, 20, 20);

    this.input.keyboard.on("keydown-UP", () => {
      this.snake.setDirection(new Phaser.Math.Vector2(0, -1));
    });

    this.input.keyboard.on("keydown-DOWN", () => {
      this.snake.setDirection(new Phaser.Math.Vector2(0, 1));
    });

    this.input.keyboard.on("keydown-LEFT", () => {
      this.snake.setDirection(new Phaser.Math.Vector2(-1, 0));
    });

    this.input.keyboard.on("keydown-RIGHT", () => {
      this.snake.setDirection(new Phaser.Math.Vector2(1, 0));
    });

    // this.input.keyboard.on("keydown-SPACE", () => {
    //   this.snake.grow();
    // });

    this.input.keyboard.on("keydown-SPACE", () => {
      this.debugText.setText("JUMP");
      this.snake.setIsJumping(1);
    });

    this.input.keyboard.on("keyup-SPACE", () => {
      this.debugText.setText("GROUND");
      this.snake.setIsJumping(0);
    });

    // this.input.enabled = true;
    this.debugText = this.add.text(10, 10, 'GROUND', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { left: 10, right: 10, top: 5, bottom: 5 },
      fontStyle: 'bold',
    });

	}

  update(time: number) {
    // this.debugText.setText();
    if(Math.floor(Math.random() * 100) == 0) {
      this.snake.grow();
    }
    if(this.gameOver) {
    } else {
      this.snake.update(time);

      if(this.snake.collideWithSelf()) {
        this.gameOver = true;
      }

      if(this.snake.isOutOfBounds()) {
        this.gameOver = true;
      }
    }
  }
}
