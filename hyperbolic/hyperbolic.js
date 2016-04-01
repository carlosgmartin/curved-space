var dimensions = 2;

/* Returns the sum of two vectors */
function sum(vector1, vector2) {
  var result = [];
  for (var i = 0; i < dimensions; ++i) {
    result[i] = vector1[i] + vector2[i];
  }
  return result;
}

/* Returns the difference of two vectors */
function difference(vector1, vector2) {
  return sum(vector1, scale(vector2, -1));
}

/* Returns the metric tensor */
function get_metric(position) {
  var factor = 1;
  for (var i = 0; i < dimensions; ++i) {
    factor -= position[i] * position[i];
  }
  
  var result = [];
  for (var i = 0; i < dimensions; ++i) {
    result[i] = [];
    for (var j = 0; j < dimensions; ++j) {
      if (i == j) {
        result[i][j] = 1/(factor * factor);
      } else {
        result[i][j] = 0;
      }
    }
  }
  return result;
}

/* Returns the connection coefficients */
function get_connection(position) {
  var factor = 1;
  for (var i = 0; i < dimensions; ++i) {
    factor -= position[i] * position[i];
  }
  
  var result = [];
  for (var i = 0; i < dimensions; ++i) {
    result[i] = [];
    for (var j = 0; j < dimensions; ++j) {
      result[i][j] = [];
      for (var k = 0; k < dimensions; ++k) {
        result[i][j][k] = 0;
        if (i == k) result[i][j][k] += position[j];
        if (i == j) result[i][j][k] += position[k];
        if (j == k) result[i][j][k] -= position[i];
        result[i][j][k] *= 2/factor;
      }
    }
  }
  return result;
}

/* Returns a raycast */
function get_ray(position, velocity, steps) {
  var positions = [];
  positions[0] = position;
  positions[1] = sum(position, velocity);
  for (var step = 0; step < steps; ++step) {
    positions[step + 2] = [];
    var connection = get_connection(positions[step + 1]);
    for (var i = 0; i < dimensions; ++i) {
      positions[step + 2][i] = 2 * positions[step + 1][i] - positions[step][i];
      for (var j = 0; j < dimensions; ++j) {
        for (var k = 0; k < dimensions; ++k) {
          positions[step + 2][i] -= connection[i][j][k] * (positions[step + 1][j] - positions[step][j]) * (positions[step + 1][k] - positions[step][k]);
        }
      }
    }
  }
  return positions;
}

/* Returns the product of a vector and a scalar */
function scale(vector, scalar) {
  var result = [];
  for (var i = 0; i < dimensions; ++i) {
    result[i] = vector[i] * scalar;
  }
  return result;
}

/* Returns the inner product of two vectors */
function inner(vector1, vector2, metric) {
  var result = 0;
  for (var i = 0; i < dimensions; ++i) {
    for (var j = 0; j < dimensions; ++j) {
      result += metric[i][j] * vector1[i] * vector2[j];
    }
  }
  return result;
}

/* Returns the norm of a vector */
function norm(vector, metric) {
  return Math.sqrt(inner(vector, vector, metric));
}