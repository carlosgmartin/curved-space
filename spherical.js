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

	context.fillStyle = 'red';
	context.beginPath();
	context.arc(0, 0, 10, 0, 2 * Math.PI);
	context.fill();

	context.restore();

	window.scrollTo(
		document.documentElement.scrollWidth/2 - window.innerWidth/2, 
		document.documentElement.scrollHeight/2 - window.innerHeight/2
	);
}
render();