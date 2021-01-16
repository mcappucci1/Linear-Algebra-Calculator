// Event listener for changing the size of the matrix
$(document).on("click", ".size", function() {
	// Get the size of the new matrix
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
		pivotBasis: null,
		showSteps: null,
		stepArr: null
	};
	// Send post request to server
	ajax("/dimCol", data);
});

// Event listener to compute the number of entries in the column space
$(document).on("click", ".compute-btn", function() {
	// Get size of matrix
	const row = $(".input-row").length;
	const col = $(".input-cell").length / row;

	// Create matrix for computation
	var matrix = createMatrix(row, col);
	// Create matrix to store the original entries
	var original = createMatrix(row, col);
	// Save selector for matrix inputs
	var cells = $("[type='text']");
	// Declare variable for tracking valid entries
	var validEntry = true;
	// Loop for getting the matrix values
	for(var i = 0; i < row; i++) {
		for(var j = 0; j < col; j++) {
			// Get entry in that cell
			var val = cells[i*col+j].value;
			// Error checking the entry
			if((validEntry = errorCheck(val)) == false)
				break;
			// Convert decimal to fraction if necessary
			if(val.includes("."))
				matrix[i][j] = decimalToFraction(val);
			else
				matrix[i][j] = val;
			original[i][j] = val;
		}
		// Break loop for invalid fraction
		if(!validEntry)
			break;
	}
	// Continue calculation if all the entries are valid
	if(validEntry) {
		// Get whether the user wants the steps shown
		var steps = false;
		if(row * col <= 36)
			steps = $("#steps")[0].checked;

		// Find the pivot columns of the matrix
		var pivotBasis = findPivotBasis(matrix, original, steps);

		// Add step if necessary
		if(steps) {
			var str = "The number of pivot columns is the dimension of the column space.";
			pivotBasis.stepArr.push(new Step(matrix, str));
		}

		// Create data object for ajax call
		var data = {
			matrix: original,
			pivotBasis: pivotBasis.pivotBasis,
			showSteps: steps,
			stepArr: pivotBasis.stepArr
		};
		// Perform post request to server
		ajax("/dimCol", data);
	}
});