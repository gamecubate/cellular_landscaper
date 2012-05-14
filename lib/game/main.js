ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	'impact.background-map',
	'game.cellular-automaton',
	'plugins.symbols.symbols',
	'plugins.outlinedfont',
	'plugins.impact-splash-loader',
	'impact.debug.debug'
)
.defines(function(){

MapMaker = ig.Game.extend({

	// don't clear the screen as we want to show the underlying CSS background
	clearColor: null,

	// pause or play?
	gameState: null,
	
	// How big is our simulated world, and what are its constraints?
	COLS: 40,
	ROWS: 60,
	PADDING: 0,
	
	// Cellular Automaton(s) and maps
	ca: null,
	ground: null,
	
	// Controls the interval at which we tell the automaton(s) to advance one step
	simulationTimer: null,
	stepDuration: 0.1,
	
	// Instructions
	//font: new ig.Font( 'media/04b03-black.font.png' ),
	font: new OutlinedFont('media/outlinedfont.png', 1),

	init: function()
	{
		// Setup game state symbols
		new ig.Symbols("PLAYING PAUSED");

		// Automata maintain state, maps depict that state
		this.initAutomata();
		this.initMaps();
		
		// Setup sim timer
		this.simulationTimer = new ig.Timer();

		// Handle mouse and keyboard events
		ig.input.bind(ig.KEY._1, '1');
		ig.input.bind(ig.KEY._2, '2');
		ig.input.bind(ig.KEY._3, '3');
		ig.input.bind(ig.KEY._4, '4');
		ig.input.bind(ig.KEY._5, '5');
		ig.input.bind(ig.KEY.SPACE, 'pause');
		ig.input.bind(ig.KEY.MOUSE1, 'mouse1');
		
		// Go!
		this.gameState = ig.Entity.PLAYING;
	},

	initAutomata: function ()
	{
		this.ca = new Conway (this.COLS, this.ROWS);
		this.ca.seed (0.15);
	},

	initMaps: function ()
	{
		// BG
		var data = this.createData (this.COLS, this.ROWS, 1);
		var bg = new ig.BackgroundMap (8, data, new ig.Image ('media/bg-full.png'));
		bg.preRender = true;	// render once and be done with it; will save cycles
		this.backgroundMaps.push (bg);

		// Landscape
		data = this.createData (this.COLS, this.ROWS);
		this.ground = new ig.BackgroundMap (8, data, new ig.Image ('media/landscape-full-beige.png'));
		this.backgroundMaps.push (this.ground);
	},
	
	createData: function (cols, rows, fillValue)
	{
		var fill = fillValue | 0;
		var data = [];
		for (var row=0; row<rows; row++)
		{
			data[row] = [];
			for (var col=0; col<cols; col++)
				data[row][col] = fill;
		}
		return data;
	},
	
	update: function ()
	{
		if (this.gameState & ig.Entity.PLAYING)
		{
			this.updateSimulation (this.ca, this.ground);
		}

		this.handleKeys();
		this.handleMouse();
		this.parent ();
	},
	
	updateSimulation: function (automaton, map)
	{
		if (this.simulationTimer.delta() > 0 && this.stepDuration > 0)
		{
			var states = automaton.data;
			var newStates = automaton.next ();

			// iterate
			for (var row=this.PADDING; row<this.ROWS-this.PADDING; row++)
			{
				for (var col=this.PADDING; col<this.COLS-this.PADDING; col++)
				{
					var state = states[row][col];
					var newState = newStates[row][col];
					var mapTileIndex = map.data[row][col];
					var maxIndex = map.tiles.width / map.tilesize;

					if (state == CellState.DEAD && newState == CellState.ALIVE)
					{
						if (mapTileIndex < maxIndex)
						{
							map.data[row][col] = mapTileIndex + 1;
						}
					}
				}
			}
			
			// next step at...
			this.simulationTimer.set (this.stepDuration);
		}
	},
	
	handleKeys: function()
	{
		if (ig.input.pressed('1'))
			this.stepDuration = 1;
		else if (ig.input.pressed('2'))
			this.stepDuration = 0.5;
		else if (ig.input.pressed('3'))
			this.stepDuration = 0.25;
		else if (ig.input.pressed('4'))
			this.stepDuration = 0.1;
		else if (ig.input.pressed('5'))
			this.stepDuration = 0.05;
		else if (ig.input.pressed('pause'))
			this.gameState = this.gameState == ig.Entity.PAUSED ? ig.Entity.PLAYING : ig.Entity.PAUSED;
	},
	
	handleMouse: function ()
	{
		if (ig.input.released("mouse1"))
		{
			this.ground.data = this.createData (this.COLS, this.ROWS);
			this.ca.reset ();
			this.ca.seed (0.15, this.PADDING);
			this.gameState = ig.Entity.PLAYING;
		}
	},

	draw: function()
	{
		ig.system.context.clearRect (0 ,0, ig.system.realWidth, ig.system.realHeight);
		this.parent();
		this.font.draw ('MOUSE: RESET     1-5: SPEED     SPACE: PAUSE/PLAY', ig.system.width/2, 5, ig.Font.ALIGN.CENTER);
	},
});


// Start the Game with 30fps, a resolution of 320x480, unscaled, and use splash loader plugin
ig.main ('#canvas', MapMaker, 30, 320, 480, 1, ig.ImpactSplashLoader);

});
