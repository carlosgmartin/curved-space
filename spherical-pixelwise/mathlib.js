var math = {
    radius: 1,
    sqrt: Math.sqrt,
    cos: Math.cos,
    sin: Math.sin,
    acos: Math.acos,
    sum: function (vector1, vector2) {
        return {
            x: vector1.x + vector2.x,
            y: vector1.y + vector2.y,
            z: vector1.z + vector2.z
        };
    },
    difference: function (vector1, vector2) {
        return {
            x: vector1.x - vector2.x,
            y: vector1.y - vector2.y,
            z: vector1.z - vector2.z
        };
    },
    scale: function (vector, scalar) {
        return {
            x: vector.x * scalar,
            y: vector.y * scalar,
            z: vector.z * scalar
        };
    },
    unit: function (vector) {
        return math.scale(vector, 1 / math.norm(vector));
    },
    inner: function (vector1, vector2) {
        return vector1.x * vector2.x + vector1.y * vector2.y + vector1.z * vector2.z;
    },
    norm: function (vector) {
        return math.sqrt(math.inner(vector, vector))
    },
    angle: function (vector1, vector2) {
        return math.acos(math.inner(vector1, vector2) / (math.norm(vector1) * math.norm(vector2)));
    },
    scalar_projection: function (vector1, vector2) {
        return math.inner(vector1, math.unit(vector2));
    },
    vector_projection: function (vector1, vector2) {
        return math.scale(math.unit(vector2), math.scalar_projection(vector1, vector2))
    },
    rejection: function (vector1, vector2) {
        return math.difference(vector1, math.vector_projection(vector1, vector2));
    },
    /* Exponential map: Returns point on the sphere given tangent vector and starting point */
    exponential: function (point, tangent) {
        var length = math.norm(tangent);
        var angle = length / math.radius;
        var normal_component = math.radius * math.cos(angle);
        var normal_vector = math.scale(math.unit(point), normal_component);
        var tangential_component = math.radius * math.sin(angle);
        var tangential_vector = math.scale(math.unit(tangent), tangential_component);
        return math.sum(normal_vector, tangential_vector);
    },
    /* Fast version of exponential map, assumes unit radius */
    exponential_fast: function (point, tangent) {
        var length = Math.sqrt(tangent.x * tangent.x + tangent.y * tangent.y + tangent.z * tangent.z);
        var normal_component = Math.cos(length);
        var tangential_component = Math.sin(length);
        return {
            x: point.x * normal_component + tangent.x / length * tangential_component,
            y: point.y * normal_component + tangent.y / length * tangential_component,
            z: point.z * normal_component + tangent.z / length * tangential_component
        };
    },
    /* Logarithmic map: Returns tangent vector given starting and ending points */
    logarithm: function (point1, point2) {
        var angle = math.angle(point1, point2);
        var length = angle * math.radius;
        var direction = math.unit(math.rejection(point2, point1));
        return math.scale(direction, length);
    },
    /* Extends the magnitude of a vector by a fixed length */
    extend: function (vector, scalar) {
        var direction = math.unit(vector);
        var magnitude = math.norm(vector) + scalar;
        return math.scale(direction, magnitude);
    },
    /* Gives the parallel transport of a vector by a tangent vector */
    transport: function (point, tangent, vector) {
        var length = math.norm(tangent);
        var angle = length / math.radius;
        var normal_direction = math.unit(point);
        var tangential_direction = math.unit(tangent);
        var normal_component = math.inner(vector, normal_direction);
        var tangential_component = math.inner(vector, tangential_direction);
        var normal_vector = math.scale(normal_direction, normal_component);
        var tangential_vector = math.scale(tangential_direction, tangential_component);
        var rest = math.difference(vector, math.sum(normal_vector, tangential_vector));
        var normal_component2 = normal_component * math.cos(angle) - tangential_component * math.sin(angle);
        var tangential_component2 = normal_component * math.sin(angle) + tangential_component * math.cos(angle);
        var normal_vector2 = math.scale(normal_direction, normal_component2);
        var tangential_vector2 = math.scale(tangential_direction, tangential_component2);
        return math.sum(rest, math.sum(normal_vector2, tangential_vector2));
    },
    /* Converts spherical coordinates (azimuth and inclination) to 3D ambient Cartesian coordinates */
    from_spherical: function (azimuth, inclination) {
        return {
            x: math.radius * math.cos(inclination),
            y: math.radius * math.sin(inclination) * math.cos(azimuth),
            z: math.radius * math.sin(inclination) * math.sin(azimuth)
        };
    },
    /* Returns a random number generated from a Gaussian distribution */
    gaussian: function(mean, standard_deviation) {
        var y2;
        var use_last = false;
        var y1;
        if(use_last) {
           y1 = y2;
           use_last = false;
        }
        else {
            var x1, x2, w, multiplier;
            do {
                 x1 = 2.0 * Math.random() - 1.0;
                 x2 = 2.0 * Math.random() - 1.0;
                 w  = x1 * x1 + x2 * x2;               
            } while( w >= 1.0);
            w = Math.sqrt((-2.0 * Math.log(w))/w);
            y1 = x1 * w;
            y2 = x2 * w;
            use_last = true;
       }

       return mean + standard_deviation * y1;
    }
};