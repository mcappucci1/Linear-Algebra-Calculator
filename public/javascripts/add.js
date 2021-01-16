// Event listener for changing the size of the matrix
// Gets new size of matrix and send post request to server
$(document).on("click", ".size", function() {
	// Get size of the matrix
	const row = parseInt($("#rows").val());
	const col = parseInt($("#cols").val());
	// Create new matrix
	var matrix = createMatrix(row, col);
	// Create data object for ajax call
	var data = {
		matrix1: matrix,
		matrix2: matrix,
		solution: null,
		steps: null
	};
	// Send ajax call to server on route /add
	ajax("/add", data);
});

// Event listener for computing the sum of two matricies
$(document).on("click", ".compute-btn", function() {
	// Get the row and column sizes
	const row = parseInt($("#rows").val());
	const col = parseInt($("#cols").val());
	// Create matrix
	var matrix = createMatrix(row, col);
	// Get the operation to be performed
	var op = $("#operation").val();
	// Get whether the user wants the steps
	var step = $("#steps").val();
	// Store the selector for the matrix inputs
	var cells = $("input[type|='text']");
	// Create matricies to store original entries
	var matrix1 = createMatrix(row, col);
	var matrix2 = createMatrix(row, col);
	// Create steps matrix if user wants it
	var steps = null;
	if(step)
		steps = createMatrix(row,col);

	// Fill the matricies and add entries together
	for(var i = 0; i < row; i++) {
		for(var j = 0; j < col; j++) {
			// Get values from both matricies
			var val1 = cells[i*col+j].value;
			var val2 = cells[(row * col) + (i*col+j)].value;
			// Error checking for empty entry and nonvalid fractions, decimals, integers
			if((validEntry = errorCheck(val1)) == false)
				break;
			else if((validEntry = errorCheck(val2)) == false)
				break;
			// Add values to matricies
			matrix1[i][j] = val1;
			matrix2[i][j] = val2;
			// Change any decimals to fractions
			if(val1.includes("."))
				val1 = decimalToFraction(val1);
			if(val2.includes("."))
				val2 = decimalToFraction(val2);
			// Add values and add steps if user wants
			if(op == "+") {
				matrix[i][j] = fractionMath(val1, val2, "add");
				if(step) {
					steps[i][j] = matrix1[i][j] + " + " + matrix2[i][j];
				}
			}
			// Subtract and add steps otherwise
			else {
				matrix[i][j] = fractionMath(val1, val2, "subtract");
				if(step) {
					steps[i][j] = matrix1[i][j] + " - " + matrix2[i][j];
				}
			}
		}
		// End function and alert user if entries are invalid
		if(!validEntry) {
			break;
		}
	}

	// Add decimal values to solution matrix
	addDecimalValues(matrix);
	
	// Create data object for ajax call
	var data = {
		matrix1: matrix1,
		matrix2: matrix2,
		solution: matrix,
		steps: steps
	};
	// Send post request to server
	ajax("/add", data);
});