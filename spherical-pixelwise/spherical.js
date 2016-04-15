var canvas = document.getElementById('canvas');
canvas.width = 400;
canvas.height = 400;
var context = canvas.getContext('2d');

var frame_scale = 50;
var frame_point = {x: 1, y: 0, z: 0};
var frame_x = {x: 0, y: 1, z: 0};
var frame_y = {x: 0, y: 0, z: 1};

var disc = {x: 0, y: 1, z: 0};
// var disc_radius = .2;
var disc_radius = .5;







var width = canvas.width;
var height = canvas.height;
var image_data = context.createImageData(width, height);
var data = image_data.data;
function render_pixel()
{
    var index = 0;
    for (var j = 0; j < height; ++j) {
        for (var i = 0; i < width; ++i) {
            var pixel_x = (i - width/2) / width * frame_scale;
            var pixel_y = (j - height/2) / height * frame_scale;




            var tangent = {
                x: frame_x.x * pixel_x + frame_y.x * pixel_y,
                y: frame_x.y * pixel_x + frame_y.y * pixel_y,
                z: frame_x.z * pixel_x + frame_y.z * pixel_y
            };
            var length = Math.sqrt(tangent.x * tangent.x + tangent.y * tangent.y + tangent.z * tangent.z);
            var normal_component = Math.cos(length);
            var tangential_component = Math.sin(length);
            var point_x = frame_point.x * normal_component + tangent.x / length * tangential_component;
            var point_y = frame_point.y * normal_component + tangent.y / length * tangential_component;
            var point_z = frame_point.z * normal_component + tangent.z / length * tangential_component;

            var angle = Math.acos(Math.abs(point_x * disc.x + point_y * disc.y + point_z * disc.z));

            if (angle < disc_radius)
            {
                //data[index++] = 255;
                var y = 1 - (angle * angle) / (disc_radius * disc_radius);
                data[index++] = y * 255; // red
            }
            else
            {
                data[index++] = 0; // red
            }
            data[index++] = 0; // green
            data[index++] = 0; // blue
            data[index++] = 255;
        }
    }
    context.putImageData(image_data, 0, 0);
    window.scrollTo(
        document.documentElement.scrollWidth/2 - window.innerWidth/2, 
        document.documentElement.scrollHeight/2 - window.innerHeight/2
    );
}







function render()
{
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = 'white';
    context.beginPath();
    context.arc(canvas.width/2, canvas.height/2, 2, 0, 2 * Math.PI);
    context.fill();

    context.save();
    context.translate(canvas.width/2, canvas.height/2);
    context.scale(frame_scale, frame_scale);

    context.fillStyle = 'red';
    var dx = 1/frame_scale * 2;
    var dy = 1/frame_scale * 2;
    var size_x = 1/frame_scale * canvas.width/2;
    var size_y = 1/frame_scale * canvas.height/2;
    context.beginPath();
    for (var pixel_x = -size_x; pixel_x < size_x; pixel_x += dx)
    {
        for (var pixel_y = -size_y; pixel_y < size_y; pixel_y += dy)
        {
            var vector = {
                x: frame_x.x * pixel_x + frame_y.x * pixel_y,
                y: frame_x.y * pixel_x + frame_y.y * pixel_y,
                z: frame_x.z * pixel_x + frame_y.z * pixel_y
            }
            var point = math.exponential_fast(frame_point, vector);
            var inner = point.x * disc.x + point.y * disc.y + point.z * disc.z;
            if (Math.acos(Math.abs(inner)) < disc_radius)
            {
                context.rect(pixel_x, pixel_y, dx, dy);
            }
        }
    }
    context.fill();

    context.restore();
    window.scrollTo(
        document.documentElement.scrollWidth/2 - window.innerWidth/2, 
        document.documentElement.scrollHeight/2 - window.innerHeight/2
    );
}



var speed = .05;
var scaling = 1.01;
setInterval(function() {
    /* Move left */
    if (keys[65]) {
        var tangent = math.scale(frame_x, -speed);
        var frame_new_point = math.exponential(frame_point, tangent);
        var frame_new_x = math.transport(frame_point, tangent, frame_x);
        frame_point = frame_new_point;
        frame_x = frame_new_x;
    }
    /* Move right */
    if (keys[68]) {
        var tangent = math.scale(frame_x, speed);
        var frame_new_point = math.exponential(frame_point, tangent);
        var frame_new_x = math.transport(frame_point, tangent, frame_x);
        frame_point = frame_new_point;
        frame_x = frame_new_x;
    }
    /* Move up */
    if (keys[83]) {
        var tangent = math.scale(frame_y, speed);
        var frame_new_point = math.exponential(frame_point, tangent);
        var frame_new_y = math.transport(frame_point, tangent, frame_y);
        frame_point = frame_new_point;
        frame_y = frame_new_y;
    }
    /* Move down */
    if (keys[87]) {
        var tangent = math.scale(frame_y, -speed);
        var frame_new_point = math.exponential(frame_point, tangent);
        var frame_new_y = math.transport(frame_point, tangent, frame_y);
        frame_point = frame_new_point;
        frame_y = frame_new_y;
    }
    /* Zoom in */
    if (keys[81]) {
        if (frame_scale > .13) {
            frame_scale /= scaling;
        }
    }
    /* Zoom out */
    if (keys[69]) {
        frame_scale *= scaling;
    }
    //render();
    render_pixel();
}, 1000/60);

var keys = {};
addEventListener('keydown', function(event) {
    keys[event.which] = true;
});
addEventListener('keyup', function(event) {
    keys[event.which] = false;
});

/* Zoom in and out using mouse wheel */
addEventListener('mousewheel', function(event) {
    frame_scale *= Math.exp(-event.wheelDelta / 10000);
    event.preventDefault();
});