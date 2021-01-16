// Event listener for changing matrix size
$(document).on("click", ".size", function() {
	// Get the new size of the matrix
	const row = parseInt($("#rows").val());
	const col = parseInt($("#cols").val());
	// Create new matrix
	var matrix = createMatrix(row, col);
	for(var i = 0; i < row; i++) {
		for(var j = 0; j < col; j++) {
			matrix[i][j] = "";
		}
	}
	// Create data object for ajax call
	var data = {
		matrix: matrix,
		numFree: 0,
		showSteps: false,
		showSolution: false,
		stepArr: null
	};
	// Send post request to server
	ajax("/dimNull", data);
});

// Event listener for computing the dimension of the null space
// Dimension of the null space is the number of non pivot columns (matrix cols - column space cols)
$(document).on("click", ".compute", function() {
	// Get the size of the matrix
	const row = $(".input-row").length;
	const col = $(".input-cell").length / row;

	// Create matrix for calculating column space
	var matrix = createMatrix(row, col);
	// Matrix to save original entries
	var original = createMatrix(row, col);
	// Save selectors for matrix inputs
	var cells = $("[type='text']");
	// Variable to track whether the inputs are valid
	var validEntry = true;
	// Loop to fill matricies
	for(var i = 0; i < row; i++) {
		for(var j = 0; j < col; j++) {
			// Save value
			var val = cells[i*col+j].value;
			// Error check entry
			if(!(validEntry == errorCheck(val)))
				break;
			// Convert decimal entry to fraction for caluclation
			if(val.includes("."))
				matrix[i][j] = decimalToFraction(val);
			else
				matrix[i][j] = val;
			original[i][j] = val;
		}
		// Break loop for invalid entry
		if(!validEntry)
			break;
	}

	// Continue with calculations if all entries are valid
	if(validEntry) {
		// See whether user wants steps to be shown
		var steps = false;
		if(row * col <= 36)
			steps = $("#steps")[0].checked;

		// Find the column space of the matrix
		var pivotBasis = findPivotBasis(matrix, original, steps)

		// Get the dimension of the null space
		const numFree = col - pivotBasis.pivotBasis.length;

		// Add last step if necessary
		if(steps) {
			var str = "Dimension of the null basis is the number of free variables, aka the number of columns - number of entries in column space.";
			pivotBasis.stepArr.push(new Step(matrix, str));
		}

		// Create data object for ajax call
		var data = {
			matrix: original,
			numFree: numFree,
			showSteps: steps,
			showSolution: true,
			stepArr: pivotBasis.stepArr
		};
		// Send post request to server
		ajax("/dimNull", data);
	}
});