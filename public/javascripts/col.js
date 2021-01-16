// Event listener to change the size of the matrix
$(document).on("click", ".size", function() {
	// Get the size of the matrix
	const row = parseInt($("#rows").val());
	const col = parseInt($("#cols").val());
	// Create the new size matrix
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
	// Perform ajax call
	ajax("/col", data);
});

// Event listener to compute the column space of the matrix
// Finds column space by finding all the pivot columns, each pivot col is entry in col space
$(document).on("click", ".compute-btn", function() {
	// Get size of matrix
	const row = $(".input-row").length;
	const col = $(".input-cell").length / row;

	// Create matrix for computation
	var matrix = createMatrix(row, col);
	// Create matrix to save original entries
	var original = createMatrix(row, col);
	// Get selector for cell entries
	var cells = $("[type='text']");
	// Variable that tracks valid entries
	var validEntry = true;
	// Loop that fills the matrix
	for(var i = 0; i < row; i++) {
		for(var j = 0; j < col; j++) {
			// Save cell entry
			var val = cells[i*col+j].value;
			// Erro check entry
			if(!(validEntry = errorCheck(val)))
				break;
			// Convert decimal to fraction if necessary
			if(val.includes("."))
				matrix[i][j] = fractionToDecimal(val);
			else
				matrix[i][j] = val;
			original[i][j] = val;
		}
		// Break loop if invalid entry
		if(!validEntry)
			break;
	}

	// If all entries are valid, continue with the calculations
	if(validEntry) {
		// If the user wants
		var steps = false;
		if(row * col <= 36) {
			steps = $("#steps")[0].checked;
		}
		// Get the pivot basis of the matrix
		var pivotBasis = findPivotBasis(matrix, original, steps);

		// If user wants steps then add new step
		if(steps) {
			var str = "Pivot columns of original matrix form vectors of the column space.";
			pivotBasis.stepArr.push(new Step(matrix, str));
		}

		// Get decimal values
		addDecimalValues(pivotBasis.pivotBasis);

		// Create data object for ajax call
		var data = {
			matrix: original,
			pivotBasis: pivotBasis.pivotBasis,
			showSteps: steps,
			stepArr: pivotBasis.stepArr
		};
		// Send ajax call
		ajax("/col", data);
	}
});