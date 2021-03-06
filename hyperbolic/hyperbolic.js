var canvas = document.createElement('canvas');
canvas.width = 500;
canvas.height = 500;
document.body.appendChild(canvas);
var context = canvas.getContext('2d');
context.lineWidth = .001;

var canvas2 = document.createElement('canvas');
canvas2.width = 500;
canvas2.height = 500;
document.body.appendChild(canvas2);
var context2 = canvas2.getContext('2d');
context2.lineWidth = .001;

var position = [.5, 0];
var object = [.5, 0];
var object_radius = .1;

var keys = {};
var key_up = 87;
var key_down = 83;
var key_left = 65;
var key_right = 68;
addEventListener('keydown', function(e) {
  keys[e.which] = true;
});
addEventListener('keyup', function(e) {
  keys[e.which] = false;
});

var speed = .02;
function render() {
  requestAnimationFrame(render);
  
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.translate(canvas.width/2, canvas.height/2);
  context.scale(150, 150);
  
  context.beginPath();
  context.arc(0, 0, 1, 0, 2*Math.PI);
  context.stroke();
  
  if (keys[key_left]) position[0] -= .01;
  if (keys[key_right]) position[0] += .01;
  if (keys[key_up]) position[1] -= .01;
  if (keys[key_down]) position[1] += .01;
  
  var ray_number = 150;
  var rays = [];
  for (var angle = 0; angle < 2*Math.PI; angle += 2*Math.PI / ray_number) {
    var velocity = scale([Math.cos(angle), Math.sin(angle)], speed);
    rays.push(get_ray(position, velocity, 100));
  }
  
  /* Mirror partner */
  /* for (var angle = 0; angle < 2*Math.PI; angle += .1) {
    var v0 = .001 * Math.cos(angle);
    var v1 = .001 * Math.sin(angle);
    var dist2 = position[0] * position[0] + position[1] * position[1];
    rays.push(get_ray([position[0]/dist2, position[1]/dist2], [v0, v1], 500));
  } */
  
  for (var ray = 0; ray < rays.length; ++ray) {
    var positions = rays[ray];
    context.beginPath();
    context.moveTo(positions[0][0], positions[0][1]);
    for (var step = 0; step < positions.length; ++step) {
      var metric = get_metric(positions[step]);
      var object_displacement = difference(positions[step], object);
      var object_distance = norm(object_displacement, metric);
      if (object_distance < object_radius) {
        context.fillRect(positions[step][0], positions[step][1], .01, .01);
      }
      context.lineTo(positions[step][0], positions[step][1]);
    }
    context.stroke();
  }
  context.resetTransform();
  
  context2.clearRect(0, 0, canvas.width, canvas.height);
  context2.translate(canvas.width/2, canvas.height/2);
  context2.scale(15000, 15000);
  
  for (var ray = 0; ray < rays.length; ++ray) {
    var positions = rays[ray];
    var distance = 0;
    var velocity = difference(positions[1], positions[0]);
    for (var step = 0; step < positions.length; ++step) {
      var metric = get_metric(positions[step]);
      if (step > 0) {
        var displacement = difference(positions[step], positions[step - 1]);
        distance += norm(displacement, metric);
      }
      var screen_position = scale(velocity, distance);
      context2.fillRect(screen_position[0], screen_position[1], .0001, .0001);
      
      var object_displacement = difference(positions[step], object);
      var object_distance = norm(object_displacement, metric);
      if (object_distance < object_radius) {
        context2.fillRect(screen_position[0], screen_position[1], .0005, .0005);
      }
    }
  }
  context2.resetTransform();
}
render();