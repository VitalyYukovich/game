var widthCanvas= 1000;
var heightCanvas = 600;
var config = {
    type: Phaser.WebGL,
    parent: 'phaser-example',
    width: widthCanvas,
    height: heightCanvas,
    physics:{
		default: 'arcade',
		arcade: {
            gravity: { y: 400 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update, 
        pack: {
            files: [
                { type: 'scenePlugin', key: 'SpineWebGLPlugin', url: './js/SpineWebGLPlugin.js', sceneKey: 'spine' }
            ]
        }
    }
};
var game = new Phaser.Game(config);
var bg_ground;
var loki, thor;
var hpLoki=1, hpThor=1;
var lineHpLoki, lineHpThor;
var graphicsHpThor, graphicsHpLoki;
var graphics;
var animateLoki = 'idle_apple',animateThor = 'idle_apple';
var graphicsAim;
var graphicsWin;
var lineAim;
var lineAimX1 = 170, lineAimY1 = 350, lineAimX2 = 370, lineAimY2 = 200;
var flagIsDown = false;
var flagIsAnimate = false;
var coordMouseDownX = 0, coordMouseDownY = 0;
var distMoveX = 0, distMoveY = 0;
var weaponThor,weaponLoki;
var fatalityWeapon;
var isFatality = false;
var rotationWeaponThor = 0;
var rotationWeaponLoki = 0;
var isTurn = false;
var labelDist;
var velocityX=[-1000, - 900, -550]; 
var velocityY=[-200, -210,  -200];
var indexVelocity=0;
function preload(){
	this.load.image('bg', ' ./resources/BG/bg.png');
    this.load.image('bg_ground', ' ./resources/BG/bg_ground.png');
    this.load.image('iconThor', ' ./resources/UI/icon_thor.png');
    this.load.image('iconLoki', ' ./resources/UI/icon_loki.png');
    this.load.image('logo', ' ./resources/UI/logo.png');
    this.load.image('weaponThor', ' ./resources/Character/Thor/hammer_thor.png');
    this.load.image('weaponLoki', ' ./resources/Character/Loki/upgrade_loki_spear.png');
    this.load.image('finishHim', ' ./resources/UI/finish_him.png');
    this.load.image('chest', ' ./resources/UI/chest.png');
    this.load.spritesheet('lightning', './resources/FX/lightning.png', { frameWidth: 250, frameHeight: 510, endFrame: 2 });
	this.load.setPath('./resources/Character/');
	this.load.spine('loki', 'loki_upgraded.json', 'loki_upgraded.atlas');
	this.load.spine('thor', 'thor_odinson.json', 'thor_odinson.atlas');
}

function create(){
	var heightGround = heightCanvas/8; 
    var bg = this.add.image(0, heightCanvas - heightGround, 'bg');
    
    var scaleX=1500/bg.width;
    var scaleY=(heightCanvas - heightGround)/bg.height;
    scaleBg = scaleX>scaleY?scaleX:scaleY;
    
    bg.setOrigin(0, 1);
    bg.setScale(scaleBg);
    
    bg_ground = this.add.sprite(0, heightCanvas - heightGround, 'bg_ground').setScale(scaleBg).setOrigin(0, 0); 
    this.physics.add.existing(bg_ground, true);
    
    var xLabel = widthCanvas/4;
    var yLabel = heightCanvas/11;
    var line = new Phaser.Geom.Line(xLabel, yLabel, widthCanvas-xLabel, yLabel);
    graphics =  this.add.graphics();
    graphicsHpThor = this.add.graphics();
    graphicsHpLoki =  this.add.graphics();
   
    graphics.lineStyle(40, '0x9438a0');
    graphics.strokeLineShape(line);
    
    lineHpThor = new Phaser.Geom.Line(xLabel, yLabel, xLabel+(line.x2-line.x1)/3.3, yLabel);
    lineHpLoki = new Phaser.Geom.Line(widthCanvas-xLabel, yLabel, xLabel + 2.3*(line.x2-line.x1)/3.3, yLabel);
    var lineEnemyHpThor = new Phaser.Geom.Line(xLabel, yLabel, xLabel+(line.x2-line.x1)/3.3, yLabel);
    var lineEnemyHpLoki = new Phaser.Geom.Line(widthCanvas-xLabel, yLabel, xLabel + 2.3*(line.x2-line.x1)/3.3, yLabel);
    graphics.lineStyle(25, '0x91148d');
    graphics.strokeLineShape(lineEnemyHpThor);
    graphics.strokeLineShape(lineEnemyHpLoki);   
    graphicsHpThor.lineStyle(25, '0xff0000');
    graphicsHpThor.strokeLineShape(lineHpThor);
    graphicsHpLoki.lineStyle(25, '0xff0000');
    graphicsHpLoki.strokeLineShape(lineHpLoki);
    
    this.add.image(xLabel, yLabel, 'iconThor').setScale(0.18);
    this.add.image(widthCanvas-xLabel, yLabel, 'iconLoki').setScale(0.18);
    this.add.image(widthCanvas/2, yLabel, 'logo').setScale(0.23);
    thor = this.add.spine(100, 525, 'thor', animateThor, true).setScale(0.3);
	loki = this.add.spine(1200, 525, 'loki', animateLoki, true).setScale(0.3);
	cam = this.cameras.main.startFollow(thor, true);
	loki.flipX=true;
	
	var polygonDist = new Phaser.Geom.Polygon([900,420,960,420, 960, 435, 975, 450, 960, 465, 960,480,900,480]);
	graphics.fillStyle('0x91148d');
	graphics.fillPoints(polygonDist.points, true);
	labelDist = this.add.text(930, 450, '',{ fontFamily: 'Arial', fontSize: 30, color: '#ffffff' }).setOrigin(0.5)
	
	graphicsAim = this.add.graphics();
	this.physics.add.existing(loki,true);
	this.physics.add.existing(thor,true);
	loki.body.width=loki.skeletonData.width*0.3;
	loki.body.height=loki.skeletonData.height*0.3;
	loki.body.x=1200 - loki.body.width/2;
	loki.body.y=525 - loki.body.height;
	
	thor.body.width=thor.skeletonData.width*0.3;
	thor.body.height=thor.skeletonData.height*0.3;
	thor.body.x=100 - thor.body.width/2;
	thor.body.y=525 - thor.body.height;
	
	configLightning = {
            key: 'lightAnimate',
            frames: this.anims.generateFrameNumbers('lightning', { start: 0, end: 2, first: 0}),
            frameRate: 3
    };
	this.cameras.main.setBounds(0, 0, 720 * 2, 176);
	this.input.on('pointerdown', pointerDownHandler, this);
	this.input.on('pointerup', pointerUpHandler, this);
	this.input.on('pointermove', pointerMoveHandler, this);
}
function drawAim(){
	graphicsAim.clear();
	var countPoints=7;
	var points = lineAim.getPoints(countPoints);
    for (var i = 0; i < countPoints; i++)
    {
    	graphicsAim.fillStyle(0xffffff);
    	graphicsAim.fillCircle(points[i].x, points[i].y, countPoints - i);
    }
}
function pointerDownHandler (pointer){
	if(!isTurn){
		flagIsDown = true;
		thor.play('grenade_draw',false); 
		lineAim = new Phaser.Geom.Line(lineAimX1, lineAimY1,lineAimX2,lineAimY2);
		weaponThor = this.physics.add.image(0, 0, 'weaponThor').setScale(0.3);
		weaponLoki = this.physics.add.image(0, 0, 'weaponLoki').setScale(0.3);
		weaponThor.visible=false;
		weaponLoki.visible=false;
		drawAim(lineAim);
		coordMouseDownX=pointer.x;
		coordMouseDownY=pointer.y;
	}
}
function pointerUpHandler (pointer){
	if(!flagIsDown) return;
	isTurn = true;
	graphicsAim.clear();
	flagIsDown=false;
	thor.play('grenade_shot',false);
	weaponThor.visible=true;
	weaponThor.setVelocity(distMoveX*10, distMoveY*5);
	rotationWeaponThor = 0.2;
	weaponThor.x=150;
	weaponThor.y=400;
	cam._follow=weaponThor;
	rnd = Phaser.Math.Between(4,15)/100;
	weaponThor.setBounce(rnd);
	this.physics.add.collider(weaponThor, loki, weaponThorInLoki, null, this);
	this.physics.add.collider(weaponThor, bg_ground, weaponThorAndGround, null, this);
	
	this.physics.add.collider(weaponLoki, thor, weaponLokiInThor, null, this);
	this.physics.add.collider(weaponLoki, bg_ground, weaponLokiAndGround, null, this);
	setTimeout(function(){
		if(!isFatality){
			cam._follow = loki;
			loki.play('grenade_shot',false);
			weaponLoki.x=1150;
			weaponLoki.y=400;
			console.log( velocityY[indexVelocity]+ ' ' + velocityX[indexVelocity]);
			weaponLoki.setVelocity(velocityX[indexVelocity], velocityY[indexVelocity]);
			if(indexVelocity<2)indexVelocity++;
			weaponLoki.visible=true;
			rotationWeaponLoki = 0.2;
			cam._follow=weaponLoki;
			
			rnd = Phaser.Math.Between(4,15)/100;
			weaponLoki.setBounce(rnd);
			setTimeout(function(){
				loki.play('idle_apple',true);
				cam._follow = thor;
			},3000);
		}
	}, 2000);
	isTurn = false;
	if(isFatality) {
		finalScreen(this);
	}
}
function pointerMoveHandler (pointer){
	if(!flagIsDown) return;
		distMoveX = coordMouseDownX - pointer.x;
		distMoveY = coordMouseDownY - pointer.y;
		lineAim.x2= distMoveX + lineAimX2;
		lineAim.y2= distMoveY + lineAimY2;
		drawAim();
}
function weaponThorInLoki(){
	//weaponThor.setVelocity(-100, 200)
	if(hpLoki<=0){
		fatalityWeapon = this.physics.add.image(loki.x-100,-50, 'weaponThor');
		fatalityWeapon.setScale(0.3);
		fatalityWeapon.setVelocity(100,400);
		this.physics.add.collider(loki, fatalityWeapon, function(){
			fatalityWeapon.setVelocity(200,-100);
			lightning = this.add.sprite(loki.x, loki.body.y+10, 'lightning');
			lightning.setOrigin(0.5, 1);
			lightning.setScale(0.4);
			this.anims.create(configLightning);
			lightning.anims.play('lightAnimate');
		}, null, this);
		return ;
	}
	rotationWeaponThor = 0.1;
	loki.play('fall',false);
	setTimeout(function(){
		loki.play('idle_apple',true);
	}, 2100);
	hpLoki-=0.5;
	lineHpLoki.x2 =  lineHpLoki.x1 - (lineHpLoki.x1 - lineHpLoki.x2)*hpLoki;
	graphicsHpLoki.clear();
	graphicsHpLoki.lineStyle(25, '0xff0000');
	graphicsHpLoki.strokeLineShape(lineHpLoki);
	if(hpLoki<=0 && !isFatality){
		isFatality = true;
		this.add.image(loki.x,loki.body.y * 0.9,'finishHim').setScale(0.3);
		loki.play('finish_him',true);
		setTimeout(function(){
			cam._follow=thor;
		}, 1000);
	}
}
function weaponLokiInThor(){
	rotationWeaponLoki = 0.1;
	//console.log(loki);
	thor.play('scare',false);
	setTimeout(function(){
		thor.play('idle_apple',true);
	}, 2100);
	hpThor-=0.30;
	lineHpThor.x2 =  lineHpThor.x1 - (lineHpThor.x1 - lineHpThor.x2)*hpThor;
	graphicsHpThor.clear();
	graphicsHpThor.lineStyle(25, '0xff0000');
	graphicsHpThor.strokeLineShape(lineHpThor);
}
function weaponThorAndGround(){
	rotationWeaponThor = 0;
	weaponThor.disableBody();
}
function weaponLokiAndGround(){
	rotationWeaponLoki = 0;
	weaponLoki.disableBody();
}
function update(){
	if(weaponThor)
		weaponThor.rotation+=rotationWeaponThor;
	if(weaponLoki)
		weaponLoki.rotation+=rotationWeaponLoki;
	if(fatalityWeapon)
		fatalityWeapon.rotation+=0.1;
	labelDist.setText(Phaser.Math.RoundTo((loki.x - cam._follow.x)/2.71-18));
}

function finalScreen(game){
	game.input.off('pointerdown', pointerDownHandler, game);
	game.input.off('pointerup', pointerUpHandler, game);
	game.input.off('pointermove', pointerMoveHandler, game);
    var polygon = new Phaser.Geom.Polygon([
        500,0,1000,0,1000,600,500,600,
        520,580,500,560,520,540,500,520,520,500,
        500,480,520,460,500,440,520,420,500,400,
        520,380,500,360,520,340,500,320,520,300,
        500,280,520,260,500,240,520,220,500,200,
        520,180,500,160,520,140,500,120,520,100,
        500,80,520,60,500,40,520,20
    ]);
    setTimeout(function(){
    	thor.play('win',true);
    	cam._follow = thor;
    },2000);
    setTimeout(function(){
    	graphicsWin = game.add.graphics();
	    graphicsWin.fillStyle(0xcc11ff);
	    graphicsWin.fillPoints(polygon.points, true);
	    game.add.image(750, 100, 'logo').setScale(0.4);
	    game.add.text(750, 220, 'You got a prize!',{ fontFamily: 'Arial', fontSize: 40, color: '#ffffff' }).setOrigin(0.5);
	    game.add.image(750, 350, 'chest').setScale(0.4);
	    var polygonButtonBlue = new Phaser.Geom.Polygon([600, 480,900,480,900,570,600,570]);
	    var polygonButtonWhite = new Phaser.Geom.Polygon([590, 470,910,470,910,580,590,580]);
	    graphicsWin.fillStyle(0xfffffff);
	    graphicsWin.fillPoints(polygonButtonWhite.points, true);
	    graphicsWin.fillStyle(0x00ccff);
	    graphicsWin.fillPoints(polygonButtonBlue.points, true);
	    game.add.text(750, 525, 'PLAY NOW',{ fontFamily: 'Arial', fontSize: 48, color: '#ffffff'}).setOrigin(0.5);
    },3000);
}