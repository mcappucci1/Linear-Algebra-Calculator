// Event listener for changing matrix size
// Gets new size from user and sends post request to server
$(document).on("click", ".size", function() {
	// Get size
	const size = parseInt($("#size").val());
	// Create new matrix
	var matrix = createMatrix(size, size);
	// Create data object for post request
	var data = {
		matrix: matrix,
		showSteps: false,
		stepArr: null
	};
	// Send request to server
	ajax("/determinant", data);
});

// Event listener for compute button
// Computes the determinant using the row echelon form and coefficient from row swaps
// Sends computed result to server ikn post request
$(document).on("click", ".compute-btn", function() {
	// Create coefficient
	var coefficient = 1;
	// Get size of matrix
	const size = parseInt($("#size").val());
	// Create matrix for computation
	var matrix = createMatrix(size, size);
	// Create matrix fro storing original values
	var copy = createMatrix(size, size);

	// Save selector for cells of user entry
	var cells = $("[type='text']");
	// Create var for tracking valid user entry
	var validEntry = true;
	// Loop that fills matricies
	for(var i = 0; i < size; i++) {
		for(var j = 0; j < size; j++) {
			var val = cells[i*size+j].value;
			// Error checking for empty entry and nonvalid fractions, decimals, integers
			if((validEntry = errorCheck(val)) == false) {
				break;
			}
			// If the entry is a decimal, put it in fraction form
			if(val.includes(".")) {
				matrix[i][j] = decimalToFraction(val);
				decimal = true;
			}
			// Otherwise just add the value
			else
				matrix[i][j] = val;
			copy[i][j] = val;
		}
		// End function and alert user if entries are invalid
		if(!validEntry) {
			break;
		}
	}

	// If all the entries are valid continue with finding the determinant
	if(validEntry) {
		// See if the user wants to show the steps
		var steps = $("#steps")[0].checked;
		// Calculate the row echelon form of the entered matrix
		var rrefSolution = rref(matrix, steps, false, true);
		// Create the determinant variable
		var det = "1";
		// Add determinant calculation to the steps if necessary
		if(steps) {
			var str = "Multiply values across the diagonal, and the sign change from row replacement.";
			rrefSolution.stepArr.push(new Step(matrix, str));
		}
		// Multiply the determinant by the vaues along the diagonal of the matrix in row echelon form
		for(var i = 0; i < size; ++i) {
			det = fractionMath(det, matrix[i][i], "multiply");
		}
		// Multiply the determinant by the coefficient from row swaps
		det = fractionMath(det, rrefSolution.coefficient, "multiply");

		// Create data object for ajax call
		var data = {
			matrix: copy,
			determinant: det,
			showSteps: $("#steps")[0].checked,
			stepArr: rrefSolution.stepArr
		};
		// Send post request to server via ajax
		ajax("/determinant", data);
	}
});