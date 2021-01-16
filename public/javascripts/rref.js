// Change matrix size on size button press
// Change size of matrix and send post request to server
$(document).on("click", ".size", function() {
	// Get the row and col size
	const row = parseInt($("#rows").val());
	const col = parseInt($("#cols").val());
	// Create matrix
	var matrix = createMatrix(row, col);
	// Create data object for ajax call
	var data = {
		matrix: matrix,
		showSteps: false,
		solution: null,
		stepArr: null
	};
	// ajax call function
	ajax("/rref", data);
});

// Calculate rref or row echelon form of matrix on compute button press
// Compute and send post request to server
$(document).on("click", ".compute-btn", function() {
	// Get the row and col sizes
	const row = parseInt($("#rows").val());
	const col = parseInt($("#cols").val());
	// Create matrix for echelon form and matrix for saving entries
	var matrix = createMatrix(row, col);
	var original = createMatrix(row, col);
	// Cell value selector to get entered values
	var cells = $("[type='text']");
	// Variable to track valid or invalid entries
	var validEntry = true;

	// Loop to error check and fill caculation matricies
	for(var i = 0; i < row; i++) {
		for(var j = 0; j < col; j++) {
			// Get cell value
			var val = cells[i*col+j].value;
			// Error checking for empty entry and nonvalid fractions, decimals, integers
			if((validEntry = errorCheck(val)) == false) {
				break;
			}
			// Get fraction value of decimal entry
			if(val.includes(".")) {
				matrix[i][j] = decimalToFraction(val);
				decimal = true;
			}
			// Otherwise just add value to matrix
			else
				matrix[i][j] = val;
			original[i][j] = val;
		}
		// End function and alert user if entries are invalid
		if(!validEntry) {
			break;
		}
	}

	// If entries are valid then continue with calculations
	if(validEntry) {
		// Calculate rref matrix and steps
		var stepArr = rref(matrix, $("#steps")[0].checked, $("#reduced")[0].checked, false);
		// Get decimal values
		addDecimalValues(matrix);
		// Setup data object for request
		var data = {
			matrix: original,
			showSteps: $("#steps")[0].checked,
			solution: matrix,
			stepArr: stepArr
		};
		// Make post request to server
		ajax("/rref", data);
	}
});