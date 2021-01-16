// Event listener for changing the size of the matrix
$(document).on("click", ".size", function() {
	// Get size of the matrix
	const size = parseInt($("#size").val());
	// Create matrix
	var matrix = createMatrix(size, size);
	// Create data object for ajax call
	var data = {
		matrixSteps: null,
		inverseSteps: null,
		inverse: null,
		showSolution: false,
		initialState: matrix
	};
	// Send post request to the server
	ajax("/inverse", data);
});

// Event listener to compute the inverse of a matrix
	// Inverse is computed by reow reducing matrix to identity matrix
	// Every action taken on the matrix entered is simultaneously done on the identity matrix
	// Once the matrix is reduced to the identity, the matrix that was originally identity is now the inverse
$(document).on("click", ".compute-btn", function() {
	// Get the size of the matrix
	const size = parseInt($("#size").val());
	// Create matrix for rref to identity
	var matrix = createMatrix(size, size);
	// Create matrix for storing entries
	var initialState = createMatrix(size, size);
	// Create matrix for computing the inverse
	var identity = createMatrix(size, size);

	// Store the selector for matrix inputs
	var cells = $("[type='text']");
	// Create variable for tracking the valid entries
	var validEntry = true;
	// Loop to fill matricies
	for(var i = 0; i < size; i++) {
		for(var j = 0; j < size; j++) {
			// Store value of matrix
			const val = cells[i*size+j].value;
			// Error check for 
			if((validEntry = errorCheck(val)) == false) {
				break;
			}
			// Convert entry to fraction if its a decimal
			if(val.includes("."))
				matrix[i][j] = decimalToFraction(val);
			else
				matrix[i][j] = val;
			// Save entry
			initialState[i][j] = matrix[i][j];
			// Fill the identity matrix
			if(i == j) {
				identity[i][j] = "1";
			}
			else {
				identity[i][j] = "0";
			}
		}
		// Break loop if entry is not valid
		if(!validEntry)
			break;
	}

	// Continue with calculation if all entries are valid
	if(validEntry) {
		// Calculate rref of matrix
		var steps = rref(matrix, true, true, false);
		// Create variable to store singular
		var singular = false;
		// Stop calculation if matrix did not reduce to identity (doesn't have inverse)
		for(var i = 0; i < size; i++) {
			for(var j = 0; j < size; j++) {
				if(matrix[i][j] != identity[i][j]) {
					singular = true;
					break;
				}
			}
		}
		// Create variable for the steps computing the inverse
		var inverseSteps = null;
		// If matrix is not singular continue with calculation
		if(singular == false) {
			// Get whether the user wants the steps to be shown
			var showSteps = $("#steps")[0].checked;
			if(showSteps) {
				var inverseSteps = [];
			}
			// Calculate the inverse based on the steps from the rref calculation
			for(var i = 0; i < steps.length; i++) {
				// Break the step text into an array of numbers
				// Doing this get the row numbers and coefficient for swaps and subtractions in rref calculation
				var arr = steps[i].step.match(/[-]*\d+([\/]\d+)?/g);
				// If the step is a swap, perform swap on identity matrix with same rows
				if(steps[i].step.includes("swap")) {
					swap(identity, arr[0]-1, arr[1]-1);
				}
				// If step is a subtraction, perform the subtraction on the same row with same coefficient
				else if(steps[i].step.includes("subtract")) {
					for(var k = 0; k < identity[0].length; k++)
						identity[arr[2]-1][k] = fractionMath(identity[arr[2]-1][k], fractionMath(identity[arr[1]-1][k], arr[0], "multiply"), "subtract");
				}
				// If step is a multiplication, perform multiplication with same coefficient on same row
				else if(steps[i].step.includes("multiply")) {
					for(var k = 0; k < identity[0].length; k++)
						identity[arr[0]-1][k] = fractionMath(identity[arr[0]-1][k], arr[1], "multiply");
				}
				// Add identity to step array if user wants
				if(showSteps) {
					inverseSteps.push(new Step(identity, ""));
				}
			}

			// Get decimal values for inverse
			addDecimalValues(identity);
		}
		else {
			identity = null;
		}

		// Create data object for ajax call
		var data = {
			matrixSteps: steps,
			inverseSteps: inverseSteps,
			inverse: identity,
			showSolution: true,
			initialState: initialState
		};
		// Send post request to server
		ajax("/inverse", data);
	}
});