<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

class PhotoGallery {
	var $config = array();
	var $err = false;
	var $errors = array();

	function pr($obj) {
		print '<pre>';
		print_r($obj);
		print '</pre>';
	}
	
	function head($title) {
		$thumb_height = ($this->config['thumb_height'] + 20) . 'px';
		print <<<__HTML
		<html>
			<head>
				<title>$title</title>
				<link rel="stylesheet" href="css/styles.css">
			</head>
			<body>
__HTML;
	}
	
	function foot() {
		if ($this->err) {
			print "<!--\n\nERRORS:\n\n";
			$this->pr($this->errors);
			print "\n\n-->\n\n";
		}
		print <<<__HTML
			</body>
			<script src="js/jquery-1.11.3.min.js"></script>
			<script src="js/gallery.js"></script>
		</html>
__HTML;
		exit(0);
	}
	
	function ohDear($msg) {
		$this->head("Oh Dear : $msg");
		print <<<__HTML
			<h1>Oh Dear!</h1>
			<h2>Something has gone wrong: $msg</h2>
__HTML;
		$this->foot();
	}
	
	function whoops($msg) {
		$this->errors[] = $msg;
		$this->err = true;
	}
	
	function processImage($file) {
		$image_path = $this->config['path'] . $file;
		$thumb_path = $this->config['thumb_path'] . $file;
		if ($this->config['regen'] ||  !file_exists($thumb_path)) {
			$this->imageResize($image_path, $this->config['thumb_height'], $thumb_path);
		}
		if (file_exists($thumb_path)) {
			$exif = exif_read_data($image_path);
			if (!is_array($exif)) {
				$exif = array();
			}
			
			$rotate = 0;
			list($w, $h) = getimagesize($image_path);
				
			if(!empty($exif['Orientation'])) {
				switch($exif['Orientation']) {
					case 8:
						$rotate = 270;
						break;
					case 3:
						$rotate = 180;
						break;
					case 6:
						$rotate = 90;
						break;
				}
			}
			
			//if ($rotate == 270 || $rotate == 90) {
			//	$ow = $w;
			//	$w = $h;
			//	$h = $ow;
			//}
		
			print "<li><a href=\"$image_path\" class=\"gallery-thumb\"><img src=\"$thumb_path\" data-rotate=\"$rotate\" data-width=\"$w\" data-height=\"$h\"></a></li>";
		}
	}
	
	function __construct() {
		if (!file_exists('config.json')) {
			$this->ohDear("No config file found!");
		} else {
			$this->config = json_decode(file_get_contents('config.json'), true);
			
			$this->config['regen'] = array_key_exists('regen', $_GET);
			
			if (!array_key_exists('path', $this->config) || !file_exists($this->config['path']) || !is_dir($this->config['path'])) {
				$this->ohDear("The path in your config is not valid!");
			} else {
				$this->config['path'] .= preg_match('/\/$/', $this->config['path']) ? '' : '/';
				$this->config['thumb_path'] = $this->config['path'] . 'thumbs/';
				if (!is_dir($this->config['thumb_path'])) {
					mkdir($this->config['thumb_path']);
					if (!is_dir($this->config['thumb_path'])) {
						$this->ohDear("We couldn't create the thumbnail path!");
					}
				}
				
				$dfh = opendir($this->config['path']);
				$images = array();
				while (false !== ($file = readdir($dfh))) { 
					if ($file == '.' || $file == '..') { 
						continue; 
					} else {
						if (preg_match('/\.(jpe?g|gif|png)$/i', $file)) {
							$file_path = $this->config['path'] . $file; 
							$images[] = $file;
						}
					}
				}
				closedir($dfh);
				
				$this->head('Gallery!');
				
				print <<<__HTML
				<div id="largeImageFrame">
					<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" id="largeImage">
				</div>
				
				<div class="thumb-container" id="thumbContainer">
				<ul class="thumbs">
__HTML;
				
				foreach ($images as $idx => $img) {
					$this->processImage($img);
				}
				print '</ul>';
				print '</div><!-- #thumbContainer -->';
				$this->foot();
			}
		}
	}
	
	function imageResize($src, $height, $dst){
		if(!list($w, $h) = getimagesize($src)) {
			$this->pr($w); $this->pr($h);
			$this->whoops("Unsupported src image w/h: $src");
			return false;
		}
		
		$exif = exif_read_data($src);
		if (!is_array($exif)) {
			$exif = array();
		}
		
		if (preg_match('/\.(?<ext>[^\.]+)$/', $src, $matches)) {
			$src_ext = $matches['ext'];
		} else {
			$this->whoops("Bad src extension: $src");
			return false;
		}
		
		if (preg_match('/\.(?<ext>[^\.]+)$/', $dst, $matches)) {
			$dst_ext = $matches['ext'];
		} else {
			$this->whoops("Bad dst extension: $dst");
			return false;
		}
		
		if (preg_match('/jpe?g/i', $src_ext)) {
			$img = imagecreatefromjpeg($src);
			$type = 'jpeg';
		} elseif (preg_match('/gif/i', $src_ext)) {
			$img = imagecreatefromgif($src);
			$type = 'gif';
		} elseif (preg_match('/png/i', $src_ext)) {
			$img = imagecreatefrompng($src);
			$type = 'png';
		} else {
			$this->whoops("Unsupported src image type: $src_ext");
			return false;
		}
		
		if(!empty($exif['Orientation'])) {
			switch($exif['Orientation']) {
				case 8:
					$ow = $w;
					$w = $h;
					$h = $ow;
					$img = imagerotate($img, 90, 0);
					break;
				case 3:
					$img = imagerotate($img, 180, 0);
					break;
				case 6:
					$ow = $w;
					$w = $h;
					$h = $ow;
					$img = imagerotate($img, -90, 0);
					break;
			}
		}
		
		$width = ($height / $h) * $w;
		$x = 0;
	
		$new = imagecreatetruecolor($width, $height);
	
		if($type == "gif" || $type == "png"){
			imagecolortransparent($new, imagecolorallocatealpha($new, 0, 0, 0, 127));
			imagealphablending($new, false);
			imagesavealpha($new, true);
		}
		imagecopyresampled($new, $img, 0, 0, $x, 0, $width, $height, $w, $h);

		if (preg_match('/jpe?g/i', $dst_ext)) {
			imagejpeg($new, $dst);
		} elseif (preg_match('/gif/i', $dst_ext)) {
			imagegif($new, $dst);
		} elseif (preg_match('/png/i', $dst_ext)) {
			imagepng($new, $dst);
		} else {
			$this->whoops("Unsupported dst image type: $dst_ext");
			return false;
		}
		
		imagedestroy($img);
		imagedestroy($new);

		return true;
	} // imageResize()
}


$gallery = new PhotoGallery();