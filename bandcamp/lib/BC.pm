use Moose;
use MooseX::Aliases;
use Moops;


class BC {
  use Data::Printer;
	use WWW::Mechanize;
	use WWW::Mechanize::Cached;
	use Web::Scraper;
	use CHI;
  use FindBin;
	use URI::Escape;
	use Text::Unidecode;
  use Encode qw(encode_utf8 decode_utf8);
  use JSON::PP;
	use POSIX;

	
  has 'base_url' => (
    is => 'rw',
    isa => 'Str',
    default => 'https://bandcamp.com/'
  );
  
  has 'debug' => (
    is => 'rw',
    isa => 'Bool',
    default => 0
  );
  
  has 'debug_log' => (
    is => 'rw',
    isa => 'ArrayRef',
    default => sub { return []; }
  );
  
	has 'mech' => (
		is => 'rw',
		isa => 'WWW::Mechanize::Cached',
		default => sub {
      my $cache = CHI->new(
        driver   => 'File',
        root_dir => "$FindBin::Bin/tmp",
        expires_in => '1 day'
      );
      
			my $m = new WWW::Mechanize::Cached(
				agent => 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.87 Safari/537.36',
				autocheck => 0,
        cache => $cache
			);
			$m->max_redirect(0);
			return $m;
		}
	);
  
  has 'json' => (
    is => 'rw',
    isa => 'JSON::PP',
    default => sub {
      my $coder = JSON::PP->new->ascii->pretty->allow_nonref;
      $coder->allow_barekey(1);
    }
  );
  
  method fetch(Str $url) {
    $self->mech->get($url);
  }
  
  method debug_msg(Str $msg, Bool $newline = 1) {
    #$newline = defined $newline ? $newline : 1;
    
    if ($self->debug) {
      print STDERR $msg . ($newline ? "\n" : '');
    }
    
    push @{ $self->debug_log }, $msg;
    
  }
  
}

1;