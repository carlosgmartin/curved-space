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
    exponential: function (point, tangent) {
        var length = math.norm(tangent);
        var angle = length / math.radius;
        var normal_component = math.radius * math.cos(angle);
        var normal_vector = math.scale(math.unit(point), normal_component);
        var tangential_component = math.radius * math.sin(angle);
        var tangential_vector = math.scale(math.unit(tangent), tangential_component);
        return math.sum(normal_vector, tangential_vector);
    },
    logarithm: function (point1, point2) {
        var angle = math.angle(point1, point2);
        var length = angle * math.radius;
        var direction = math.unit(math.rejection(point2, point1));
        return math.scale(direction, length);
    },
    extend: function (vector, scalar) {
        var direction = math.unit(vector);
        var magnitude = math.norm(vector) + scalar;
        return math.scale(direction, magnitude);
    },
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
    fromspherical: function (azimuth, inclination) {
        return {
            x: math.radius * math.cos(inclination),
            y: math.radius * math.sin(inclination) * math.cos(azimuth),
            z: math.radius * math.sin(inclination) * math.sin(azimuth)
        };
    }
};