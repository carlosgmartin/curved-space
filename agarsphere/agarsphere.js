(function() {

    /**
     * Returns a Gaussian Random Number around a normal distribution defined by the mean
     * and standard deviation parameters.
     *
     * Uses the algorithm used in Java's random class, which in turn comes from
     * Donald Knuth's implementation of the BoxÐMuller transform.
     *
     * @param {Number} [mean = 0.0] The mean value, default 0.0
     * @param {Number} [standardDeviation = 1.0] The standard deviation, default 1.0
     * @return {Number} A random number
     */
    Math.randomGaussian = function(mean, standardDeviation) {

        mean = defaultTo(mean, 0.0);
        standardDeviation = defaultTo(standardDeviation, 1.0);

        if (Math.randomGaussian.nextGaussian !== undefined) {
            var nextGaussian = Math.randomGaussian.nextGaussian;
            delete Math.randomGaussian.nextGaussian;
            return (nextGaussian * standardDeviation) + mean;
        } else {
            var v1, v2, s, multiplier;
            do {
                v1 = 2 * Math.random() - 1; // between -1 and 1
                v2 = 2 * Math.random() - 1; // between -1 and 1
                s = v1 * v1 + v2 * v2;
            } while (s >= 1 || s == 0);
            multiplier = Math.sqrt(-2 * Math.log(s) / s);
            Math.randomGaussian.nextGaussian = v2 * multiplier;
            return (v1 * multiplier * standardDeviation) + mean;
        }

    };

    /**
     * Returns a normal probability density function for the given parameters.
     * The function will return the probability for given values of X
     *
     * @param {Number} [mean = 0] The center of the peak, usually at X = 0
     * @param {Number} [standardDeviation = 1.0] The width / standard deviation of the peak
     * @param {Number} [maxHeight = 1.0] The maximum height of the peak, usually 1
     * @returns {Function} A function that will return the value of the distribution at given values of X
     */
    Math.getGaussianFunction = function(mean, standardDeviation, maxHeight) {

        mean = defaultTo(mean, 0.0);
        standardDeviation = defaultTo(standardDeviation, 1.0);
        maxHeight = defaultTo(maxHeight, 1.0);

        return function getNormal(x) {
            return maxHeight * Math.pow(Math.E, -Math.pow(x - mean, 2) / (2 * (standardDeviation * standardDeviation)));
        }
    };

    function defaultTo(value, defaultValue) {
        return isNaN(value) ? defaultValue : value;
    }

})();

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
    coordinates: function (azimuth, inclination) {
        return {
            x: math.radius * math.cos(inclination),
            y: math.radius * math.sin(inclination) * math.cos(azimuth),
            z: math.radius * math.sin(inclination) * math.sin(azimuth)
        };
    }
};

var frame = {
    point: {x: 1, y: 0, z: 0},
    x: {x: 0, y: 200, z: 0},
    y: {x: 0, y: 0, z: 200},
    scale: 1
};

var speed = .00005;
var scaling = 1.002;
setInterval(function() {
    for (var n = 0; n < bullets.length; ++n) {
        var position = bullets[n].position;
        var velocity = bullets[n].velocity;
        bullets[n].position = math.exponential(position, velocity);
        bullets[n].velocity = math.transport(position, velocity, velocity);
    }
    
    if (keys[65]) {
        var tangent = math.scale(frame.x, -speed);
        var frame_point = math.exponential(frame.point, tangent);
        var frame_x = math.transport(frame.point, tangent, frame.x);
        frame.point = frame_point;
        frame.x = frame_x;
    }
    if (keys[68]) {
        var tangent = math.scale(frame.x, speed);
        var frame_point = math.exponential(frame.point, tangent);
        var frame_x = math.transport(frame.point, tangent, frame.x);
        frame.point = frame_point;
        frame.x = frame_x;
    }
    if (keys[83]) {
        var tangent = math.scale(frame.y, speed);
        var frame_point = math.exponential(frame.point, tangent);
        var frame_y = math.transport(frame.point, tangent, frame.y);
        frame.point = frame_point;
        frame.y = frame_y;
    }
    if (keys[87]) {
        var tangent = math.scale(frame.y, -speed);
        var frame_point = math.exponential(frame.point, tangent);
        var frame_y = math.transport(frame.point, tangent, frame.y);
        frame.point = frame_point;
        frame.y = frame_y;
    }
    if (keys[81]) {
        if (frame.scale > .13) {
            frame.scale /= scaling;
        }
    }
    if (keys[69]) {
        frame.scale *= scaling;
    }
    render();
}, 1000/60);

var points = [];

var create_sprinkling;
create_sprinkling = function (number) {
    for (var n = 0; n < number; ++n) {
        point = {
            x: Math.randomGaussian(),
            y: Math.randomGaussian(),
            z: Math.randomGaussian()
        }
        point = math.unit(point);
        point = math.scale(point, math.radius);
        points.push(point);
    }
};
create_sprinkling(1000);

var create_grid = function (major, minor) {
    for (var azimuth = 0; azimuth < 2 * Math.PI; azimuth += 2 * Math.PI / major) {
        for (var inclination = 0; inclination <= Math.PI; inclination += Math.PI / minor) {
            points.push(math.coordinates(azimuth, inclination));
        }
    }
    for (var azimuth = 0; azimuth < 2 * Math.PI; azimuth += 2 * Math.PI / minor) {
        for (var inclination = 0; inclination <= Math.PI; inclination += Math.PI / major) {
            points.push(math.coordinates(azimuth, inclination));
        }
    }
};
//create_grid(8, 64);

var bullets = [];
bullets.push({
    position: {
        x: 1,
        y: 0,
        z: 0
    },
    velocity: {
        x: 0,
        y: .01,
        z: 0
    }
});

var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

var render = function () {
    context.fillStyle = 'gray';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.translate(canvas.width/2, canvas.height/2);
    context.scale(frame.scale, frame.scale);
    
    context.fillStyle = 'black';
    context.beginPath();
    context.arc(0, 0, math.norm(frame.x) * Math.PI * math.radius * 5, 0, 2 * Math.PI);
    context.fill();
    
    context.fillStyle = 'white';
    points.forEach(function(point) {
        var logarithm = math.logarithm(frame.point, point);
        var x = math.inner(logarithm, frame.x);
        var y = math.inner(logarithm, frame.y);
        context.beginPath();
        context.arc(x, y, 1, 0, 2 * Math.PI);
        context.fill();
    });
    points.forEach(function(point) {
        var logarithm = math.extend(math.logarithm(frame.point, point), -2*Math.PI*math.radius);
        var x = math.inner(logarithm, frame.x);
        var y = math.inner(logarithm, frame.y);
        context.beginPath();
        context.arc(x, y, 1, 0, 2 * Math.PI);
        context.fill();
    });
    points.forEach(function(point) {
        var logarithm = math.extend(math.logarithm(frame.point, point), 2*Math.PI*math.radius);
        var x = math.inner(logarithm, frame.x);
        var y = math.inner(logarithm, frame.y);
        context.beginPath();
        context.arc(x, y, 1, 0, 2 * Math.PI);
        context.fill();
    });
    points.forEach(function(point) {
        var logarithm = math.extend(math.logarithm(frame.point, point), -4*Math.PI*math.radius);
        var x = math.inner(logarithm, frame.x);
        var y = math.inner(logarithm, frame.y);
        context.beginPath();
        context.arc(x, y, 1, 0, 2 * Math.PI);
        context.fill();
    });
    points.forEach(function(point) {
        var logarithm = math.extend(math.logarithm(frame.point, point), 4*Math.PI*math.radius);
        var x = math.inner(logarithm, frame.x);
        var y = math.inner(logarithm, frame.y);
        context.beginPath();
        context.arc(x, y, 1, 0, 2 * Math.PI);
        context.fill();
    });
    
    context.fillStyle = 'red';
    bullets.forEach(function(bullet) {
        var logarithm = math.logarithm(frame.point, bullet.position);
        var x = math.inner(logarithm, frame.x);
        var y = math.inner(logarithm, frame.y);
        context.beginPath();
        context.arc(x, y, 5, 0, 2 * Math.PI);
        context.fill();
    });
    bullets.forEach(function(bullet) {
        var logarithm = math.extend(math.logarithm(frame.point, bullet.position), -2*Math.PI*math.radius);
        var x = math.inner(logarithm, frame.x);
        var y = math.inner(logarithm, frame.y);
        context.beginPath();
        context.arc(x, y, 5, 0, 2 * Math.PI);
        context.fill();
    });
    bullets.forEach(function(bullet) {
        var logarithm = math.extend(math.logarithm(frame.point, bullet.position), 2*Math.PI*math.radius);
        var x = math.inner(logarithm, frame.x);
        var y = math.inner(logarithm, frame.y);
        context.beginPath();
        context.arc(x, y, 5, 0, 2 * Math.PI);
        context.fill();
    });
    bullets.forEach(function(bullet) {
        var logarithm = math.extend(math.logarithm(frame.point, bullet.position), -4*Math.PI*math.radius);
        var x = math.inner(logarithm, frame.x);
        var y = math.inner(logarithm, frame.y);
        context.beginPath();
        context.arc(x, y, 5, 0, 2 * Math.PI);
        context.fill();
    });
    bullets.forEach(function(bullet) {
        var logarithm = math.extend(math.logarithm(frame.point, bullet.position), 4*Math.PI*math.radius);
        var x = math.inner(logarithm, frame.x);
        var y = math.inner(logarithm, frame.y);
        context.beginPath();
        context.arc(x, y, 5, 0, 2 * Math.PI);
        context.fill();
    });
    
    context.restore();
};

var keys = {};
addEventListener('keydown', function(event) {
    keys[event.which] = true;
});
addEventListener('keyup', function(event) {
    keys[event.which] = false;
});