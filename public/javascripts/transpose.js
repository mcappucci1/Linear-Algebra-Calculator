// Error checking for matrix
// Takes matrix as parameter and returns false whenever there's an empty cell, true otherwise
// Different from other functions because it doesn't require valid numbers for math
function errorChecking(matrix) {
	// Loop through matrix looking for empty matrix cells
	for(let i = 0; i < matrix.length; i++) {
		for(let j = 0; j < matrix[0].length; j++) {
			if(matrix[i][j] == "") {
				return false;
			}
		}
	}
	return true;
}

// Change matrix size on button push
// Redefines matrix row and col and sends post request to server
$(document).on("click", "#size", function() {
	// Get the number of rows and columns
	const row = parseInt($("#rows").val());
	const col = parseInt($("#cols").val());
	// Create empty matrix
	let matrix = createMatrix(row, col);
	// Create data object for post request
	let data = {
		matrix: matrix,
		showSolution: false,
		solution: null
	};
	// Send request to /transpose route
	ajax("/transpose", data);
});

// Compute the transpose result on button push
// Redefines matrix so that rows become columns and vis versa, then sends post request to server
$(document).on("click", ".compute-btn", function() {
	// Get the rows and columns of 
	const row = parseInt($("#rows").val());
	const col = parseInt($("#cols").val());
	// Create transpose matrix and matrix to copy original values
	let transpose = createMatrix(col, row);
	let original = createMatrix(row, col);
	// Add values to matricies
	let cells = $("[type='text']");
	for(let i = 0; i < row; i++) {
		for(let j = 0; j < col; j++) {
			let val = cells[i*col+j].value;
			transpose[j][i] = val;
			original[i][j] = val;
		}
	}
	// Do ajax call if errorChecking passes
	if(errorChecking(transpose)) {
		// Create data object for request
		var data = {
			matrix: original,
			showSolution: true,
			solution: transpose
		};
		// Send post request to /transpose
		ajax("/transpose", data);
	}
	// If error checking fails alert the user
	else {
		alert("Must enter values in all locations.");
	}
});