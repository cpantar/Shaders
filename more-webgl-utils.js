"use strict";

/*
Given a WebGL context 'gl',
a gl shaderProgram object 'shaderProgram', and
an array of gl shaders 'shaders',
stops using the program and deletes it as well as the shaders,
thus freeing up memory and resources.
*/
function cleanup_shader_program_and_shaders( gl, shaderProgram, shaders )
{
    gl.useProgram( null );
    
    for( var i = 0; i < shaders.length; ++i )
    {
        gl.detachShader( shaderProgram, shaders[i] );
        gl.deleteShader( shaders[i] );
    }
    
    gl.deleteProgram( shaderProgram );
}
/*
Given a WebGL context 'gl',
a DOM id for the vertex shader 'vertex_shader_id', and
a DOM id for the fragment shader 'fragment_shader_id',
creates a gl shaderProgram with the specified vertex and fragment shaders
attached, sets the shaderProgram as the current program via gl.useProgram(),
and returns the array [ gl shaderProgram, gl vertex shader, gl fragment shader ].
*/
function setup_shader_program_from_vertex_shader_id_and_fragment_shader_id( gl, vertex_shader_id, fragment_shader_id )
{
    var vertexShader = getShaderById( gl, vertex_shader_id );
    var fragmentShader = getShaderById( gl, fragment_shader_id );
    
    var shaderProgram = gl.createProgram();
    gl.attachShader( shaderProgram, vertexShader );
    gl.attachShader( shaderProgram, fragmentShader );
    gl.linkProgram( shaderProgram );
    
    if( !gl.getProgramParameter( shaderProgram, gl.LINK_STATUS ) )
    {
        alert("Could not initialise shaders");
    }
    
    gl.useProgram( shaderProgram );
    
    return [ shaderProgram, vertexShader, fragmentShader ];
}

/*
Given a 'canvas' object and a desired width and height in CSS pixels,
sets the canvas size in css pixels while respecting the (possible high-) DPI of the screen.

From: http://www.khronos.org/webgl/wiki/HandlingHighDPI
*/
function set_canvas_to_css_width_and_height( canvas, desiredWidthInCSSPixels, desiredHeightInCSSPixels )
{
    // set the display size of the canvas.
    canvas.style.width = desiredWidthInCSSPixels + "px";
    canvas.style.height = desiredHeightInCSSPixels + "px";
    
    // set the size of the drawingBuffer
    var devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = desiredWidthInCSSPixels * devicePixelRatio;
    canvas.height = desiredHeightInCSSPixels * devicePixelRatio;
}
/*
Given a javascript mouse event and a container,
returns the mouse coordinates in CSS pixels in the form [ x, y ].
*/
function event_xy_in_container( evt, container )
{
    // The advice to use offsetLeft/Top:
    //     http://docs.jquery.com/Tutorials:Mouse_Position
    // is wrong.
    // Instead, using jQuery's offset() gives the desired result:
    var x = evt.pageX - $(container).offset().left;
    var y = evt.pageY - $(container).offset().top;
    
    return [ x, y ];
}
/*
The same as event_xy_in_container(), except the coordinates will be
scaled by 'devicePixelRatio' for cases where high-DPI coordinates
are desired, such as when the container's width and height are also
scaled by 'devicePixelRatio'.

NOTE: This function seems of dubious utility to me, since
      only a few elements will have had their width and height scaled,
      and the caller can always multiply x by container.width/$(container).css('width')
      and y similarly if the caller desires high-DPI coordinates.
*/
function event_xy_in_container_respecting_devicePixelRatio( evt, container )
{
    // The advice to use offsetLeft/Top:
    //     http://docs.jquery.com/Tutorials:Mouse_Position
    // is wrong.
    // Instead, using jQuery's offset() gives the desired result:
    // UPDATE: Properly handle high DPI screens: http://www.khronos.org/webgl/wiki/HandlingHighDPI
    var devicePixelRatio = window.devicePixelRatio || 1;
    var x = ( evt.pageX - $(container).offset().left ) * devicePixelRatio;
    var y = ( evt.pageY - $(container).offset().top ) * devicePixelRatio;
    
    return [ x, y ];
}
/*
The time in seconds since some arbitrary point in time.
*/
function now()
{
    return ( new Date().getTime() ) / 1000.;
}

// From: http://learningwebgl.com/blog/?p=28
function getShaderById(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }
    
    return shader;
}

function hex2rgb3fv( hex )
{
    if( hex.length == 4 ) hex = hex.replace( /([^#])/g, '$1$1' );
    // TODO Q: Why does this complain: "Uncaught TypeError: Cannot call method 'slice' of null"?
    // return hex.match(/^#(..)(..)(..)$/).slice(1).map( function( val ) { return parseInt( val, 16 )/255. } );
    return [ parseInt( hex.substr(1,2), 16 )/255., parseInt( hex.substr(3,2), 16 )/255., parseInt( hex.substr(5,2), 16 )/255. ];
}
