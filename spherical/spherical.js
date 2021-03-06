/* This is our frame of reference */
var frame = {
    point: {x: 1, y: 0, z: 0}, /* where we are */
    x: {x: 0, y: 200, z: 0}, /* where our x direction is */
    y: {x: 0, y: 0, z: 200}, /* where our y direction is */
    scale: .8 /* how to scale our coordinates */
};

var points = []; /* points to be rendered */

/* Creates a grid of points based on longitude and latitude */
var create_grid = function (major, minor) {
    for (var azimuth = 0; azimuth < 2 * Math.PI; azimuth += 2 * Math.PI / major) {
        for (var inclination = 0; inclination <= Math.PI; inclination += Math.PI / minor) {
            points.push(math.from_spherical(azimuth, inclination));
        }
    }
    for (var azimuth = 0; azimuth < 2 * Math.PI; azimuth += 2 * Math.PI / minor) {
        for (var inclination = 0; inclination <= Math.PI; inclination += Math.PI / major) {
            points.push(math.from_spherical(azimuth, inclination));
        }
    }
};
create_grid(8, 64);

/* Creates a random sprinkling of points on the sphere using a Gaussian distribution */
var create_sprinkling;
create_sprinkling = function (number) {
    for (var n = 0; n < number; ++n) {
        var point = {
            x: math.gaussian(0, 1),
            y: math.gaussian(0, 1),
            z: math.gaussian(0, 1)
        }
        point = math.unit(point);
        point = math.scale(point, math.radius);
        points.push(point);
    }
};
// create_sprinkling(1000);

/* Moving objects */
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






var speed = .00005;
var scaling = 1.01;
setInterval(function() {
    /* Update the position and velocity of projectiles by parallel transporting along their velocities */
    for (var n = 0; n < bullets.length; ++n) {
        var position = bullets[n].position;
        var velocity = bullets[n].velocity;
        bullets[n].position = math.exponential(position, velocity);
        bullets[n].velocity = math.transport(position, velocity, velocity);
    }

    /* Move left */
    if (keys[65]) {
        var tangent = math.scale(frame.x, -speed);
        var frame_point = math.exponential(frame.point, tangent);
        var frame_x = math.transport(frame.point, tangent, frame.x);
        frame.point = frame_point;
        frame.x = frame_x;
    }
    /* Move right */
    if (keys[68]) {
        var tangent = math.scale(frame.x, speed);
        var frame_point = math.exponential(frame.point, tangent);
        var frame_x = math.transport(frame.point, tangent, frame.x);
        frame.point = frame_point;
        frame.x = frame_x;
    }
    /* Move up */
    if (keys[83]) {
        var tangent = math.scale(frame.y, speed);
        var frame_point = math.exponential(frame.point, tangent);
        var frame_y = math.transport(frame.point, tangent, frame.y);
        frame.point = frame_point;
        frame.y = frame_y;
    }
    /* Move down */
    if (keys[87]) {
        var tangent = math.scale(frame.y, -speed);
        var frame_point = math.exponential(frame.point, tangent);
        var frame_y = math.transport(frame.point, tangent, frame.y);
        frame.point = frame_point;
        frame.y = frame_y;
    }
    /* Zoom in */
    if (keys[81]) {
        if (frame.scale > .13) {
            frame.scale /= scaling;
        }
    }
    /* Zoom out */
    if (keys[69]) {
        frame.scale *= scaling;
    }
    render();
}, 1000/60);







var canvas = document.getElementById('canvas');
canvas.width = 1000;
canvas.height = 1000;

var context = canvas.getContext('2d');

/* The multiple denotes how many times a geodesic wraps around the sphere */
function render_point(point, multiple, radius) {
	var logarithm = math.extend(math.logarithm(frame.point, point), multiple * 2*Math.PI*math.radius);
    var x = math.inner(logarithm, frame.x);
    var y = math.inner(logarithm, frame.y);
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.fill();
}

function render() {
	//requestAnimationFrame(render);

	context.fillStyle = 'black';
	context.fillRect(0, 0, canvas.width, canvas.height);

	context.save();

	context.translate(canvas.width/2, canvas.height/2);
    context.scale(frame.scale, frame.scale);

    /* Render fixed points */
    context.fillStyle = 'gray';
    for (var point = 0; point < points.length; ++point) {
    	for (var multiple = -2; multiple <= 2; ++multiple) {
    		render_point(points[point], multiple, 1);
    	}
    }

    /* Render projectiles */
    context.fillStyle = 'white';
    for (var bullet = 0; bullet < bullets.length; ++bullet) {
    	for (var multiple = -2; multiple <= 2; ++multiple) {
    		render_point(bullets[bullet].position, multiple, 5);
    	}
    }

    /* Render observer's origin */
	context.fillStyle = 'red';
	context.beginPath();
	context.arc(0, 0, 10, 0, 2 * Math.PI);
	context.fill();

	context.restore();

    /* Center canvas in window */
	window.scrollTo(
		document.documentElement.scrollWidth/2 - window.innerWidth/2, 
		document.documentElement.scrollHeight/2 - window.innerHeight/2
	);
}
//render();

var keys = {};
addEventListener('keydown', function(event) {
    keys[event.which] = true;
});
addEventListener('keyup', function(event) {
    keys[event.which] = false;
});

/* Zoom in and out using mouse wheel */
addEventListener('mousewheel', function(event) {
	frame.scale *= Math.exp(-event.wheelDelta / 10000);
	event.preventDefault();
});