// Event listener to change matrix sizes
$(document).on("click", "#size", function() {
	// Get new sizes of matricies
	const row1 = parseInt($("#rows1").val());
	const col1 = parseInt($("#cols1").val());
	const row2 = parseInt($("#rows2").val());
	const col2 = parseInt($("#cols2").val());
	// Check to see if the entry is valid (col 1 == row 2)
	if(col1 == row2) {
		// Create new matricies
		var matrix1 = createMatrix(row1, col1);
		var matrix2 = createMatrix(row2, col2);
		// Create data object for ajax call
		var data = {
			matrix1: matrix1,
			matrix2: matrix2,
			solution: null,
			steps: null
		};
		// Send post request to the sever
		ajax("/multiply", data);
	}
	// Otherwise alert user of error
	else {
		alert("Number of columns in matrix 1 must equal number of rows in matrix 2.");
	}
});

// Event listener to compute the result of the multiplication of the two matricies
// Computed by multiplying row values of matrix 1 by col values of matrix 2 and summing them
// Resulting matrix is size matrix 1 row x matrix 2 col 
$(document).on("click", ".compute-btn", function() {
	// Get size of matricies
	const row1 = parseInt($("#rows1").val());
	const col1 = parseInt($("#cols1").val());
	const row2 = parseInt($("#rows2").val());
	const col2 = parseInt($("#cols2").val());
	// Make sure the matricies are the corrct size
	if(col1 == row2) {
		// Create matricies to store the entries
		var matrix1 = createMatrix(row1, col1);
		var matrix2 = createMatrix(row2, col2);
		// Create var to track if all entries are valid
		var validEntry = true;
		// Store selector for text inputs
		var cells = $("[type='text']");
		// Loop to fill matrix 1
		for(var i = 0; i < row1; i++) {
			for(var j = 0; j < col1; j++) {
				// Store the values in one cell
				var val = cells[i*col1+j].value;
				// Error check for a valid integer, decimal, or fraction
				if((validEntry = errorCheck(val)) == false)
					break;
				// Convert decimal entries to fractions if necessary
				if(val.includes("."))
					matrix1[i][j] = decimalToFraction(val);
				else
					matrix1[i][j] = val;
			}
			// Break loop if an entry is invalid
			if(!validEntry) {
				break;
			}
		}
		// If entries are valid continue with calculation
		if(validEntry) {
			// Loop for filling the second matrix
			for(var i = 0; i < row2; i++) {
				for(var j = 0; j < col2; j++) {
					// Store one value from matrix 2
					var val = cells[(row1*col1) + (i*col2) + j].value;
					// Error check for a valid integer, decimal, or fraction
					if((validEntry = errorCheck(val)) == false)
						break;
					// Convert decimal entries to fractions if necessary
					if(val.includes("."))
						matrix2[i][j] = decimalToFraction(val);
					else
						matrix2[i][j] = val;
				}
				// Break the loop if there was an invalid entry
				if(!validEntry) {
					break;
				}
			}

			// Continue if all entries are valid
			if(validEntry) {
				// Create resultant matrix
				var matrix = createMatrix(row1, col2);
				// Check if the user wants the steps to be shown
				var showSteps = $("#steps")[0].checked;
				// Array to store the steps for the solution
				var steps = null;
				if(showSteps)
					steps = [];
				// Loop to calculate solution
				for(var i = 0; i < row1; i++) {
					for(var j = 0; j < col2; j++) {
						// Create str for steps 
						var str = "";
						// Loop to calculate each cell of the solution matrix
						for(var m = 0; m < matrix2.length; m++) {
							// Set the matrix value to "0" for fraction math
							if(m == 0)
								matrix[i][j] = "0";
							// Add next matrix multiplication to the sum for the cell
							matrix[i][j] = fractionMath(matrix[i][j], fractionMath(matrix1[i][m], matrix2[m][j], "multiply"), "add");
							// Add multiplication to the step string for the cell
							if(showSteps) {
								if(m != matrix2.length - 1)
									str += matrix1[i][m] + "*" + matrix2[m][j] + "+";
								else
									str += matrix1[i][m] + "*" + matrix2[m][j];
							}
						}
						// Push the step string to the step array for the completed cell
						if(showSteps)
							steps.push(str);
					}
				}
				// Add decimal values to solution matrix if there are fractions
				addDecimalValues(matrix);
				// Create data object for the ajax call
				var data = {
					matrix1: matrix1,
					matrix2: matrix2,
					solution: matrix,
					steps: steps
				};
				// Send data object to the server with a post request
				ajax("/multiply", data);
			}
		}
	}
	// If the matricies are not the correct size alert the user
	else {
		alert("Number of columns in matrix 1 must equal the number of rows in matrix 2.");
	}
});