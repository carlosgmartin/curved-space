/* This is our frame of reference */
var frame = {
    point: {x: 1, y: 0, z: 0}, /* where we are */
    x: {x: 0, y: 200, z: 0}, /* where our x direction is */
    y: {x: 0, y: 0, z: 200}, /* where our y direction is */
    scale: .5 /* how to scale our coordinates */
};

var points = []; /* points to be rendered */

var create_grid = function (major, minor) { /* creates a grid of points based on longitude and latitude */
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







var speed = .00005;
var scaling = 1.002;
setInterval(function() {
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







var canvas = document.getElementById('canvas');
canvas.width = 500;
canvas.height = 500;

var context = canvas.getContext('2d');

function render() {
	//requestAnimationFrame(render);

	context.fillStyle = 'black';
	context.fillRect(0, 0, canvas.width, canvas.height);

	context.save();

	context.translate(canvas.width/2, canvas.height/2);
    context.scale(frame.scale, frame.scale);

	context.fillStyle = 'red';
	context.beginPath();
	context.arc(0, 0, 5, 0, 2 * Math.PI);
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

	context.restore();

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

addEventListener('mousewheel', function(event) {
	frame.scale *= Math.exp(event.wheelDelta / 10000);
});