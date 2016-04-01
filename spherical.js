/* This is our frame of reference */
var frame = {
    point: {x: 1, y: 0, z: 0}, /* where we are */
    x: {x: 0, y: 200, z: 0}, /* where our x direction is */
    y: {x: 0, y: 0, z: 200}, /* where our y direction is */
    scale: 1 /* how to scale our coordinates */
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





var canvas = document.getElementById('canvas');
canvas.width = 100;
canvas.height = 100;

var context = canvas.getContext('2d');





function render() {
	requestAnimationFrame(render);

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
render();