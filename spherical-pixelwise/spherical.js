var canvas = document.getElementById('canvas');
canvas.width = 1000;
canvas.height = 1000;
var context = canvas.getContext('2d');

var frame = {
    point: {x: 1, y: 0, z: 0},
    x: {x: 0, y: 1, z: 0},
    y: {x: 0, y: 0, z: 1},
    scale: 50
};

var disc = {x: 0, y: 1, z: 0};
var disc_radius = .2;

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
    context.scale(frame.scale, frame.scale);

    context.fillStyle = 'red';
    var dx = .05;
    var dy = .05;
    var size_x = 10;
    var size_y = 10;
    for (var pixel_x = -size_x; pixel_x < size_x; pixel_x += dx)
    {
        for (var pixel_y = -size_y; pixel_y < size_y; pixel_y += dy)
        {
            var vector = {
                x: frame.x.x * pixel_x + frame.y.x * pixel_y,
                y: frame.x.y * pixel_x + frame.y.y * pixel_y,
                z: frame.x.z * pixel_x + frame.y.z * pixel_y
            }
            var point = math.exponential_fast(frame.point, vector);
            var inner = point.x * disc.x + point.y * disc.y + point.z * disc.z;
            if (Math.acos(Math.abs(inner)) < disc_radius)
            {
                context.fillRect(pixel_x, pixel_y, dx, dy);
            }
        }
    }

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