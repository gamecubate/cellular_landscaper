ig.module( 
	'game.cellular-automaton' 
)
.requires(
	'impact.game'
)
.defines(function(){

	CellState = {DEAD: 0, ALIVE: 1};

	CellularAutomaton = ig.Class.extend({
		
		cols: 0,
		rows: 0,
		inputData: null,
		data: null,
		
		init: function (cols, rows, data)
		{
			this.inputData = data;
			this.cols = cols;
			this.rows = rows;
			this.reset ();
		},
		
		reset: function ()
		{
			if (this.inputData)
			{
				this.data = this.inputData;
				return;
			}
			else
			{
				this.data = [];
				for (var row=0; row<this.rows; row++)
				{
					this.data[row] = [];
					for (var col=0; col<this.cols; col++)
						this.data[row][col] = CellState.DEAD;
				}
			}
		},

		seed: function (coverage, padding)
		{
			var margin = padding | 0;
			
			for (var row=margin; row<this.rows-margin; row++)
			{
				for (var col=margin; col<this.cols-margin; col++)
				{
					if (Math.random() < coverage)
						this.data[row][col] = CellState.ALIVE;
				}
			}
		},

		step: function ()
		{
			// Iterate over data, applying its rules

			// Override me
		},

		// Helpers
		stateAt: function (col, row)
		{
			if (this.data[row])
				return this.data[row][col];
		},

		neighborsOf: function (col, row)
		{
			var neighbors = [];
			var state;

			// above
			state = this.stateAt (col-1, row-1); if (state != undefined) neighbors[neighbors.length] = state;
			state = this.stateAt (col, row-1); if (state != undefined) neighbors[neighbors.length] = state;
			state = this.stateAt (col+1, row-1); if (state != undefined) neighbors[neighbors.length] = state;

			// left and right of
			state = this.stateAt (col-1, row); if (state != undefined) neighbors[neighbors.length] = state;
			state = this.stateAt (col+1, row); if (state != undefined) neighbors[neighbors.length] = state;

			// below
			state = this.stateAt (col-1, row+1); if (state != undefined) neighbors[neighbors.length] = state;
			state = this.stateAt (col, row+1); if (state != undefined) neighbors[neighbors.length] = state;
			state = this.stateAt (col+1, row+1); if (state != undefined) neighbors[neighbors.length] = state;

			return neighbors;
		},
		
		foundWithState: function (state, states)
		{
			var found = 0;
			for (var i=0; i<states.length; i++)
			{
				var theState = states[i];
				if (theState == state)
				{
					found += 1;
				}
			}
			return found;
		}
	});


	Conway = CellularAutomaton.extend({

	/*
	Rules
	=====
	The universe of the Game of Life is an infinite two-dimensional orthogonal
	grid of square cells, each of which is in one of three possible states, alive
	or dead.

	Every cell interacts with its eight neighbours, which are the cells that are
	horizontally, vertically, or diagonally adjacent.

	At each step in time, the following transitions occur:

	- Any live cell with fewer than two live neighbours dies, as if caused by
	under-population.

	- Any live cell with two or three live neighbours lives on to the next
	generation.

	- Any live cell with more than three live neighbours dies, as if by
	overcrowding.

	- Any dead cell with exactly three live neighbours becomes a live cell, as if
	by reproduction.

	The initial pattern constitutes the seed of the system. The first generation
	is created by applying the above rules simultaneously to every cell in the
	seed—births and deaths occur simultaneously, and the discrete moment at which
	this happens is sometimes called a tick (in other words, each generation is a
	pure function of the preceding one). The rules continue to be applied
	repeatedly to create further generations.
	*/

next: function ()
{
	// make a working copy of population data
	var nextStates = ig.copy(this.data);
	
	// iterate
	for (var row=0; row<this.rows; row++)
	{
		for (var col=0; col<this.cols; col++)
		{
			var state = this.stateAt (col, row);
			var neighbors = this.neighborsOf (col, row);
			var liveNeighbors = this.foundWithState(CellState.ALIVE, neighbors);
			
			// Any live cell with fewer than two live neighbours dies, as if caused by under-population.
			if (state == CellState.ALIVE && liveNeighbors < 2)
			{
				nextStates[row][col] = CellState.DEAD;
			}

			// Any live cell with two or three live neighbours lives on to the next generation
			else if (state == CellState.ALIVE && liveNeighbors >= 2 && liveNeighbors <= 3)
			{
				nextStates[row][col] = CellState.ALIVE;
			}
				
			// Any live cell with more than three live neighbours dies, as if by overcrowding.
			else if (state == CellState.ALIVE && liveNeighbors > 3)
			{
				nextStates[row][col] = CellState.DEAD;
			}

			// Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
			else if (state == CellState.DEAD && liveNeighbors == 3)
			{
				nextStates[row][col] = CellState.ALIVE;
			}
		}
	}
	
	this.data = nextStates;
	
	return this.data;
}
});
});
