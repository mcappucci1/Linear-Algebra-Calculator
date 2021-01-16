// Function for error checking entries in the matrix
function errorCheck(entry) {
	// Regex for fraction
	var regFraction = /^\-*[0-9][0-9]*\/[1-9][0-9]*$/g;
	// Regex for decimal
	var regDecimal = /^\-*[0-9]+([,.][0-9]+)?$/g;
	// Test entry against regular expression
	if(entry == "" || (entry.match(regFraction) == null && entry.match(regDecimal) == null)) {
		alert("Must enter a valid integer, fraction or decimal.");
		return false;
	}
	return true;
}

//Function for converting fraction to decimal
function fractionToDecimal(num) {
	// Get the numerator and denominator for the fraction given
	var fraction = num.split("/");
	// If the fraction is a whole number convert it to decimal
	if(fraction.length == 1) {
		if(fraction[0].length - fraction[0].indexOf(".") > 6)
			return parseFloat(fraction[0]).toFixed(6);
		else 
			return parseFloat(fraction[0]);
	}
	// Convert fraction to decimal
	else {
		var decimal = parseInt(fraction[0]) / parseInt(fraction[1]);
		if(decimal.toString().length - decimal.toString().indexOf(".") > 6)
			return decimal.toFixed(6);
		else
			return decimal;
	}
}

// Function to convert decimal to fraction
function decimalToFraction(num) {
	// Get the whole, and decimal parts of decimal, as well as number of decimal places
	var whole = num.split(".")[0], n = num.split(".")[1], d = Math.pow(10, n.length).toString();
	// Add the whole value to the fractional part
	var add = parseInt(whole) * parseInt(d);
	n = (parseInt(n) + add).toString();
	// Return simplified fraction
	return simplify(n + "/" + d);
}

// Function that returns matrix of certain size
function createMatrix(row, col) {
	var matrix = new Array(row);
	for(var i = 0; i < row; i++) {
		matrix[i] = new Array(col);
		for(var j = 0; j < col; j++) {
			matrix[i][j] = "";
		}
	}
	return matrix;
}

// Event listener for arrow press to move around matrix inputs
$(document).keydown(function(key) {
	// Save selectors for the matrix inputs
	var cells = $("input[type|='text']");
	// Get the index of the input currently selected
	var index;
	for(var i = 0; i < cells.length; i++) {
		if(cells[i] == $(":focus")[0]) {
			index = i;
			break;
		}
	}
	// Move the cursor if a cell is selected
	if($(":focus").prop("nodeName") == "INPUT") {
		switch(key.which) {
			// Move left
			case 37:
				if(index != 0 && cells[index].selectionStart == 0) {
					cells[index-1].focus();
					cells[index-1].setSelectionRange(cells[index-1].value.length, cells[index-1].value.length);
				}
				break;
			// Move right
			case 39:
				if(index != cells.length - 1 && cells[index].selectionStart == cells[index].value.length) {
					cells[index+1].focus();
					cells[index+1].setSelectionRange(0, 0);
				}
				break;
		}
	}
});

// Classs for steps in showing work
// Stores a copy of the current matrix given, and text step
class Step {
	constructor(matrix, step) {
		var stepMatrix = new Array(matrix.length);
		for(var i = 0; i < matrix.length; i++) {
			stepMatrix[i] = new Array(matrix[0].length);
			for(var j = 0; j < matrix[0].length; j++) {
				if(matrix[i][j] % 1 !== 0)
					stepMatrix[i][j] = matrix[i][j];
				else
					stepMatrix[i][j] = matrix[i][j];
			}
		}
		this.matrix = stepMatrix;
		this.step = step;
	}
}

// Function for sending post request to given route
// Replaces html within .page div
function ajax(route, data) {
	$.ajax({
		url: route,
		type: "POST",
		data: { data: data },
		async: true,
		cache: false,
		success: function(data, status, error) {
			var html = $.parseHTML(data);
			$.each(html, function(counter, element) {
				if($(element).hasClass("page")) {
					$(".page").html($(element).html());
				}
			});
		},
		error: function(jqXHR, status, error) {
			console.log("error jqXHR: " + jqXHR);
			console.log("error status: " + status);
			console.log("error error: " + error);
		}
	});
}

// Helper function for swapping rows in rref calculation
function swap(matrix, index1, index2) {
	var swap = matrix[index1];
	matrix[index1] = matrix[index2];
	matrix[index2] = swap;
}

// Function for finding the row echelon form or rref solution
function rref(matrix, steps, reduced, determinant) {
	// Get the size of the matrix given
	const row = matrix.length;
	const col = matrix[0].length;
	// Save number of rows completed
	var done = 0;
	// coefficent for determinant calculation
	var coefficient = 1;

	// Create step array
	if(steps) {
		var stepArr = [];
		stepArr.push(new Step(matrix, "initial state"));
	}
	else {
		var stepArr = null;
	}

	// Find echelon form
	for(var i = 0; i < col; i++) {
		// Order rows
		var current = done;
		for(var j = done; j < row; j++) {
			if(matrix[current][i] != 0) 
				++current;
			else if(matrix[current][i] == 0 && matrix[j][i] != 0) {
				swap(matrix, current, j);
				coefficient *= -1;
				if(steps) {
					var str = "swap row " + (current + 1) + " and row " + (j + 1);
					stepArr.push(new Step(matrix, str));
				}
			}
		}
		// Make all rows below the top current one 0
		for(var j = done + 1; j < row; j++) {
			if(matrix[j][i] == 0) 
				continue;
			else {
				var multiply = fractionMath(matrix[j][i], matrix[done][i], "divide");
				for(var k = i; k < col; k++) {
					var hold = fractionMath(matrix[done][k], multiply, "multiply");
					matrix[j][k] = fractionMath(matrix[j][k], hold, "subtract");
				}
				if(steps) {
					str = "subtract " + multiply + " times row " + (done + 1) + " from row " + (j + 1);
					stepArr.push(new Step(matrix, str));
				}
			}
		}
		++done;
	}

	if(determinant) {
		return {coefficient: coefficient.toString(), stepArr: stepArr};
	}

	// Reduced form
	if(reduced) {
		// Loop through each row
		for(var i = row - 1; i >= 0; i--) {
			// Loop to find the pivot position in that row
			for(var j = 0; j < col; j++) {
				// Pivot found as first non zero entry in row
				if(matrix[i][j] != 0) {
					// Make the first position 1 if it is not already
					if(matrix[i][j] != 1) {
						var multiply = fractionMath("1", matrix[i][j], "divide");
						for(var k = j; k < col; k++) {
							matrix[i][k] = fractionMath(matrix[i][k], multiply, "multiply");
						}
						if(steps) {
							str = "multiply row " + (i + 1) + " by " + multiply;
							stepArr.push(new Step(matrix, str));
						}
					}
					// Subtract the pivot position from all rows above it to make them 0
					for(var k = 0; k < row; k++) {
						if(matrix[k][j] == 0 || k == i)
							continue;
						else {
							var multiply = fractionMath(matrix[k][j], matrix[i][j], "divide");
							for(var l = j; l < col; l++)
								matrix[k][l] = fractionMath(matrix[k][l], fractionMath(matrix[i][l], multiply, "multiply"), "subtract");
							if(steps) {
								str = "subtract " + multiply + " times row " + (i + 1) + " from row " + (k + 1);
								stepArr.push(new Step(matrix, str));
							}
						}
					}
					break;
				}
			}
		}
	}

	// Get rid of -0
	for(var i = 0; i < row; i++) {
		for(var j = 0; j < col; j++) {
			if(matrix[i][j] == -0) {
				matrix[i][j] = 0;
			}
		}
	}
	
	return stepArr;
}

function findPivotBasis(matrix, original, steps) {
	var stepArr = rref(matrix, steps, false, false);
	var row = matrix.length;
	var col = matrix[0].length;
	var pivotBasis = [];
	var numPivot = 0;
	for(var i = 0; i < row; i++) {
		for(var j = 0; j < col; j++) {
			if(matrix[i][j] != 0) {
				pivotBasis.push(new Array());
				for(var k = 0; k < row; k++) {
					pivotBasis[numPivot].push(original[k][j]);
				}
				++numPivot;
				break;
			}
		}
	}

	return {
		stepArr: stepArr,
		pivotBasis: pivotBasis
	}
}

function simplify(fraction) {
	var num = fraction.split("/");
	num[0] = Math.abs(num[0]), num[1] = Math.abs(num[1]);
	while(num[1]) {
		var store = num[1];
		num[1] = num[0] % num[1];
		num[0] = store;
	}
	var gcd = num[0];
	num = fraction.split("/");
	num[0] /= gcd;
	num[1] /= gcd;
	if(num[1] == 1)
		return num[0].toString();
	else
		return num[0] + "/" + num[1];
}

function fractionMath(num1, num2, operation) {
	var frac1 = num1.split("/"), frac2 = num2.split("/");
	if(frac1.length == 1)
		frac1.push("1");
	if(frac2.length == 1)
		frac2.push("1");

	if(operation == "multiply" || operation == "divide") {
		var numNeg = 0;
		for(var i = 0; i < 2; i++) {
			if(frac1[i].includes("-")) {
				frac1[i] = frac1[i].substring(1);
				numNeg++;
			}
			if(frac2[i].includes("-")) {
				frac2[i] = frac2[i].substring(1);
				numNeg++;
			}
		}
		
		if(operation == "multiply") {
			if(numNeg % 2 == 1)
				return simplify("-" + (frac1[0] * frac2[0]) + "/" + (frac1[1] * frac2[1]));
			else
				return simplify((frac1[0] * frac2[0]) + "/" + (frac1[1] * frac2[1]));
		}
		else if(operation == "divide") {
			if(numNeg % 2 == 1)
				return simplify("-" + (frac1[0] * frac2[1]) + "/" + (frac1[1] * frac2[0]));
			else
				return simplify((frac1[0] * frac2[1]) + "/" + (frac1[1] * frac2[0]));
		}
	}
	else {
		frac1[0] *= frac2[1];
		frac2[0] *= frac1[1];
		if(operation == "add") {
			return simplify((frac1[0] + frac2[0]) + "/" + (frac1[1] * frac2[1]));
		}
		else if(operation == "subtract") {
			return simplify((frac1[0] - frac2[0]) + "/" + (frac1[1] * frac2[1]));
		}
	}
}

function addDecimalValues(matrix) {
	const row = matrix.length;
	const col = matrix[0].length;
	for(var i = 0; i < row; i++) {
		for(var j = 0; j < col; j++) {
			if(typeof(matrix[i][j]) == "string" && matrix[i][j].includes("/"))
				matrix[i][j] += " (" + fractionToDecimal(matrix[i][j]) + ")";
			else 
				matrix[i][j] = matrix[i][j];
		}
	}
}