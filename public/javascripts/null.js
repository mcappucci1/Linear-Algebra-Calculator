// Event listener for changing the size of the matrix
$(document).on("click", ".size", function() {
	// Get the new row and col size
	const row = parseInt($("#rows").val());
	const col = parseInt($("#cols").val());
	// Create the new matrix
	var matrix = createMatrix(row, col);
	for(var i = 0; i < row; i++) {
		for(var j = 0; j < col; j++) {
			matrix[i][j] = "";
		}
	}
	// Create data object for ajax call
	var data = {
		matrix: matrix,
		nullSpace: null,
		showSteps: false,
		showSolution: false,
		stepArr: null
	};
	// Post request to server
	ajax("/null", data);
});

// Event listener for computing the null psace of the matrix
$(document).on("click", ".compute-btn", function() {
	// Get size of matrix
	const row = $(".input-row").length;
	const col = $(".input-cell").length / row;

	// Create matrix for computation
	var matrix = createMatrix(row, col);
	// Create matrix for saving values entered
	var original = createMatrix(row, col);
	// Variable for tracking valid entries
	var validEntry = true;
	// Save selector for cells of input
	var cells = $("[type='text']");
	// Loop that fills the matricies
	for(var i = 0; i < row; i++) {
		for(var j = 0; j < col; j++) {
			// Save the value from the input cell
			const val = cells[i*col+j].value;
			// Error checking for the entry
			if((validEntry = errorCheck(val)) == false)
				break;
			// Convert decimal to fraction if necessary
			if(val.includes("."))
				matrix[i][j] = decimalToFraction(val);
			else
				matrix[i][j] = val;
			// Fill original value
			original[i][j] = val;
		}
		// Break loop if invalid entry
		if(!validEntry)
			break;
	}

	// Continue the calculation if all valid entries
	if(validEntry) {
		// Find if user wants steps
		var steps = false;
		if(row * col <= 36)
			var steps = $("#steps")[0].checked;

		// Find the rref form of the matrix
		var stepArr = rref(matrix, steps, true, false);

		// Get the column space of the matrix
		var pivotBasis = findPivotBasis(matrix, original, false).pivotBasis;

		// Get the column indexes of the pivot columns and use these to fill in the nullSpace
		// Array to save pivot column indicies
		var pivotCols = [];
		// Count fro mthe number of pivot columns
		var pivotCount = 0;
		// Var to track if the current column corresponds with a free variable
		var free = true;
		// Array that stores the entries of the null space
		var nullSpace = [];
		// Count the number of entries in the null space
		var nullIndex = 0;
		// Loop that finds the pivot columns and null space
		for(var j = 0; j < col; j++) {
			// Set free to true until proven otherwise
			free = true;
			// If there are pivot columns left, test to see if the current column is pivot
			if(pivotCount != pivotBasis.length) {
				// Test each entry in column to see if its the same as the next pivot column in the pivot basis
				for(var k = 0; k < row; k++) {
					if(pivotBasis[pivotCount][k] != original[j][k]) {
						free = false;
						break;
					}
				}
				// If the column a pivot column add it to the pivot column index array
				if(!free) {
					pivotCols.push(j);
					pivotCount++;
				}
			}
			// If the column does not contain a pivot position then add entry to null space
			if(free){
				// Push new vector to null space
				nullSpace.push([]);
				// Create coeficient entries for the current free variable
				for(var k = 0; k < col; k++) {
					// Add 1 to vector for entry corresponding to current free variable
					if(k == j)
						nullSpace[nullIndex].push("1");
					// Push 0 for every position in vector corresponding to entry past the current free variable
					else if(k > j)
						nullSpace[nullIndex].push("0");
					// Push the negated entry to vector for pivot variables
					else if(k < row && pivotCols.includes(k))
						nullSpace[nullIndex].push(fractionMath("-1", matrix[k][j], "multiply"));
					// Push 0 to entry for all other free variables
					else if(!pivotCols.includes(k))
						console.log("k = " + k + " push 0");
				}
				nullIndex++;
			}
		}

		// Add last step if necessary
		if(steps) {
			var str = "Represent each equation in parametric form to get the null space. Each entry is a vector which when multiplied by a free variable and summed, form the equations in the matrix.";
			stepArr.push(new Step(matrix, str));
		}

		if(nullSpace.length == 0)
			nullSpace = null;

		// Add decimal values to any fractions in the matrix
		if(nullSpace != null)
			addDecimalValues(nullSpace);

		// Create data object for ajax call
		var data = {
			matrix: original,
			nullSpace: nullSpace,
			showSteps: steps,
			showSolution: true,
			stepArr: stepArr
		};
		// Send request to server
		ajax("/null", data);
	}
});