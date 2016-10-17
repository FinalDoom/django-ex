<?php
namespace FinalDoom;
require_once "loader.php";
	require_once "variables.php";
	require_once "blockrobots.php";
	if ( !isset( $_GET["images"] ) ) {
		$h = new HeaderMaker( array(
			'title' => "Nathaniel Moseley's Images",
			'header' => "Some Pictures",
			'subheader' => "If you're actually looking for photos, check <a href='http://www.flickr.com/photos/finaldoom/'>my flickr</a>.",
			'menuhidden' => array( "img/" => "Images" ),
			'css' => array( "bootstrap/bootstrap-responsive.css",
				"bootstrap/bootstrap-image-gallery.css" ),
			'extra' => array( 
				'<!--[if lt IE 7]><link rel=>"stylesheet" href="http://blueimp.github.com/cdn/css/bootstrap-ie6.min.css"><![endif]-->', 
				'<!--[if lt IE 9]><script src=>"http://html5shim.googlecode.com/svn/trunk/html5.js"></script><![endif]-->', 
				'<script src=>"http://blueimp.github.com/JavaScript-Load-Image/load-image.min.js"></script>'),
			'js' => array( "jquery/jquery.js",
				"bootstrap/bootstrap.js",
				"bootstrap/bootstrap-image-gallery.js",
				"imggallery.js" ),
			'description' => "Nathaniel Moseley's images collection",
			'keywords' => array( "Images", "Collection" ),
		) );
		$p = new PageMaker($h);

		$p->add_content( '<p>
<button id="start-slideshow" class="btn btn-large btn-success" data-slideshow="5000" data-target="#modal-gallery" data-selector="#gallery a[rel=gallery]">Start Slideshow</button>
<button id="toggle-fullscreen" class="btn btn-large btn-primary" data-toggle="button">Toggle Fullscreen</button>
</p><div id="gallery" data-toggle="modal-gallery" data-target="#modal-gallery"></div><br><!-- modal-gallery is the modal dialog used for the image gallery -->
<div id="modal-gallery" class="modal modal-gallery hide fade"><div class="modal-header"><a class="close" data-dismiss="modal">&times;</a><h3 class="modal-title"></h3></div>
<div class="modal-body"><div class="modal-image"></div></div><div class="modal-footer">
<a class="btn btn-primary modal-next">Next <i class="icon-arrow-right icon-white"></i></a><a class="btn btn-info modal-prev"><i class="icon-arrow-left icon-white"></i> Previous</a>
<a class="btn btn-success modal-play modal-slideshow" data-slideshow="5000"><i class="icon-play icon-white"></i> Slideshow</a><a class="btn modal-download" target="_blank"><i class="icon-download"></i> Download</a>
</div></div>' );
	} else {

		$imagetypes = array( "jpg", "jpeg", "gif", "png", "bmp", "tif", "tiff", "mng" );

		function create_scaled_image($file_name, $subdir='') {
			global $curdir;
			$file_path = $curdir.$subdir.$file_name;
			$new_file_path = $curdir.'thumbnails/'.$subdir.$file_name;
			list($img_width, $img_height) = @getimagesize($file_path);
			if (!$img_width || !$img_height) {
				return false;
			}
			if (!is_dir($curdir.'thumbnails/'.$subdir)) {
				mkdir($curdir.'thumbnails/'.$subdir, 0755, true);
			}
			$scale = min(
				80 / $img_width,
				80 / $img_height
			);
			if ($scale > 1) {
				$scale = 1;
			}
			$new_width = $img_width * $scale;
			$new_height = $img_height * $scale;
			$new_img = @imagecreatetruecolor($new_width, $new_height);
			switch (strtolower(substr(strrchr($file_name, '.'), 1))) {
				case 'jpg':
				case 'jpeg':
					$src_img = @imagecreatefromjpeg($file_path);
					$write_image = 'imagejpeg';
					break;
				case 'gif':
					@imagecolortransparent($new_img, @imagecolorallocate($new_img, 0, 0, 0));
					$src_img = @imagecreatefromgif($file_path);
					$write_image = 'imagegif';
					break;
				case 'png':
					@imagecolortransparent($new_img, @imagecolorallocate($new_img, 0, 0, 0));
					@imagealphablending($new_img, false);
					@imagesavealpha($new_img, true);
					$src_img = @imagecreatefrompng($file_path);
					$write_image = 'imagepng';
					break;
				default:
					$src_img = $image_method = null;
			}
			$success = $src_img && @imagecopyresampled(
				$new_img,
				$src_img,
				0, 0, 0, 0,
				$new_width,
				$new_height,
				$img_width,
				$img_height
			) && $write_image($new_img, $new_file_path);
			// Free up memory (imagedestroy does not delete files):
			@imagedestroy($src_img);
			@imagedestroy($new_img);
			return $success;
		}

		function array_flatten($array, $return = array()) {
			for($x = 0; $x < count($array); $x++)
			{
				if(is_array($array[$x]))
				{
					$return = array_flatten($array[$x],$return);
				}
				else
				{
					if($array[$x])
					{
						$return[] = $array[$x];
					}
				}
			}
			return $return;
		}

		function get_image_object($file_name, $subdir='') {
			global $curdir, $webcurdir, $imagetypes;
			$suburl = str_replace('%2F', '/', rawurlencode($subdir));
			$file_path = $curdir.$subdir.$file_name;
			$info = pathinfo( $file_path );
			$extension = strtolower( $info['extension'] );
			if (is_file($file_path) && $file_name[0] !== '.' &&
					in_array( $extension, $imagetypes ) ) {
				$image = new stdClass();
				$image->name = $file_name;
				$image->url = $webcurdir
					.$suburl.rawurlencode($image->name);
				if (!is_file($curdir.'/thumbnails/'.$subdir.$file_name)) {
					create_scaled_image($file_name, $subdir);
				}
				$image->thumbnail = $webcurdir.'/thumbnails/'
					.$suburl.rawurlencode($image->name);
				return $image;
			} else if (is_dir($file_path) && $file_name[0] !== '.' &&
					$file_name !== "thumbnails") {
				$dirArray = scandir($curdir.$subdir.$file_name.'/');
				return array_values(array_filter(array_map(
					'get_file_object',
					$dirArray,
					array_fill( 0, count($dirArray), $subdir.$file_name.'/' )
				)));
			}
			return null;
		}
		
		function get_image_objects($subdir='') {
			global $curdir;
			$dirArray = scandir($curdir.$subdir);

			return array_flatten(array_values(array_filter(array_map(
				'get_image_object',
				$dirArray,
				array_fill( 0, count($dirArray), $subdir )
			))));
		}

		echo json_encode( array( 'images' => get_image_objects() ) );
	}


