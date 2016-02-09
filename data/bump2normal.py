'''
Author: Yotam Gingold <yotam (strudel) yotamgingold.com>
License: Public Domain. (I, Yotam Gingold, the author, dedicate any copyright to the Public Domain.)
http://creativecommons.org/publicdomain/zero/1.0/
'''

from numpy import *

def convert_bump_map_to_normal_map( bump_map_array, bumpiness = 1., finite_difference_style = 'forward' ):
    '''
    Given an NxM numpy.array 'bump_map_array' representing a height map,
    returns an NxMx3 normal map numpy.array, where the normal is computed at each
    grid location by finite differencing.
    Optional parameter 'bumpiness' scales 'bump_map_array'.
    Optional parameter 'finite_difference_style' specifies whether 'forward'
    or 'central' differencing should be used to compute the normals (default: 'forward').
    
    NOTE: The normals in the resulting normal map are not necessarily unit length.
    '''
    
    assert len( bump_map_array.shape ) == 2
    
    bump_map_array = bumpiness * bump_map_array
    
    ## The normal is the cross product of < 1, 0, df dx > and < 0, 1, df dy >,
    ## which equals < -df dx, -df dy, 1 >.
    normal_map = zeros( ( bump_map_array.shape[0], bump_map_array.shape[1], 3 ), dtype = float )
    normal_map[:,:,2] = 1.
    if 'central' == finite_difference_style:
        ## -finite difference in x
        normal_map[1:-1,1:-1,0] = bump_map_array[:-2,1:-1] - bump_map_array[2:,1:-1]
        ## -finite difference in y
        normal_map[1:-1,1:-1,1] = bump_map_array[1:-1,:-2] - bump_map_array[1:-1,2:]
        ## We performed central differencing, so divide by 2.
        normal_map[:,:,:2] *= .5
    elif 'forward' == finite_difference_style:
        ## -finite difference in x
        normal_map[:-1,1:-1,0] = bump_map_array[:-1,1:-1] - bump_map_array[1:,1:-1]
        ## -finite difference in y
        normal_map[1:-1,:-1,1] = bump_map_array[1:-1,:-1] - bump_map_array[1:-1,1:]
    else:
        raise RuntimeError( 'Unknown finite difference style: ' + finite_difference_style )
    
    return normal_map

def main():
    import sys, os
    
    def usage():
        print >> sys.stderr, 'Usage:', sys.argv[0], 'path/to/input/displacement_bump_map bumpiness_scale path/to/output_normal_offset_map'
        sys.exit(-1)
    
    try:
        inpath, bumpiness_scale, outpath = sys.argv[1:]
        bumpiness_scale = float( bumpiness_scale )
    except:
        usage()
    
    if os.path.exists( outpath ):
        print >> sys.stderr, "Output path already exists, not clobbering:", outpath
        usage()
    
    from PIL import Image
    
    ## Load the greyscale bump (displacement) map.
    img = Image.open( inpath ).convert( 'L' )
    arr = asarray( img, dtype = uint8 )
    assert len( arr.shape ) == 2
    
    ## Convert values to be between 0 and 1.
    arr = arr / 255.
    
    out = convert_bump_map_to_normal_map( arr, bumpiness_scale )
    
    ## Q: Scale everything so that the maximum coordinate in any dimension is 1?
    ## A1: The bump map has values between 0 and 1,
    ##     and so the maximum difference between any two values is already
    ##     between -1 and 1.
    ## A2: The maximum absolute difference may be less than 1, so we are
    ##     underusing the space.
    ## A3: The 'bumpiness_scale' factor means that we don't know what the
    ##     maximum value is.
    scale = abs(out).max()
    assert scale > 0
    out /= scale
    
    ## Finally, divide by 2 and add .5.
    out = .5 * ( out.clip( -1, 1 ) + 1 )
    
    ## Save the output image.
    result = Image.fromarray( asarray( ( out * 255 ).clip( 0, 255 ), dtype = uint8 ) )
    result.save( outpath )

if __name__ == '__main__': main()
