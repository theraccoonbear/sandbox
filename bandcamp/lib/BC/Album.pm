use Moose;
use Moops;

use lib '..';
use BC::Artist;

class BC::Album extends BC {
	use Data::Printer;
	use Web::Scraper;
	use URI::Escape;
	use Text::Unidecode;
	use Encode qw(encode_utf8 decode_utf8);
	use POSIX;
	#use Date::Parse;
	use Time::Piece;
	
	has 'band' => (
		is => 'rw',
		isa => 'Maybe[BC::Artist]'
	);
	
	has 'id' => (
		is => 'rw',
		isa => 'Maybe[Int]',
		alias => 'item_id'
	);
	
	has 'cover' => (
		is => 'rw',
		isa => 'Maybe[Str]'
	);
	
	has 'item_title' => (
		is => 'rw',
		isa => 'Maybe[Str]',
		alias => 'name'
	);
	
	has 'band_name' => (
		is => 'rw',
		isa => 'Maybe[Str]'
	);
	
	has 'item_url' => (
		is => 'rw',
		isa => 'Maybe[Str]',
		alias => 'url'
	);
	
	has 'tracks' => (
		is => 'rw',
		isa => 'Maybe[ArrayRef]',
		default => sub {
			return [];
		}
	);
	
	
	has 'released' => (
		is => 'rw',
		isa => 'Maybe[Time::Piece]'
	);
	
	has 'cache_age' => (
		is => 'rw',
		isa => 'Str',
		default => '1 month'
	);
	
	
	has 'albumScraper' => (
		is => 'rw',
		isa => 'Web::Scraper',
		default => sub {
			return scraper {
				#  <meta property="twitter:player" content="https://bandcamp.com/EmbeddedPlayer/v=2/album=3216549634/size=large/linkcol=0084B4/notracklist=true/twittercard=true/">
				process 'meta[property="twitter:player"]', 'album_id' => sub {
					my $url = $_->attr('content');
					$url =~ s/^.+?\/album=(\d+)\/.+$/$1/gi;
					if ($url !~ m/^\d+$/) {
						$url = undef;
					}
					return $url;
				};
				process 'h2.trackTitle', 'title' => sub { return $_->as_trimmed_text(); };
				process 'span[itemprop="byArtist"] a', 'artist_name' => 'TEXT', 'artist_url' => '@href';
				process 'tr[itemprop="tracks"]', 'tracks[]' => scraper {
					process '.track_number', 'number' => sub {
						my $n = $_->as_trimmed_text;
						$n =~ s/[^\d]//g;
						return $n;
					};
					process '.title span[itemprop="name"]', 'name' => 'TEXT';
					process '.title .time', 'length' => sub {
						my $l = $_->as_trimmed_text();
						my ($m, $s) = split(/:/, $l);
						return ($m * 60) + ($s * 1);
					};
				};
				process '#tralbumArt a', 'cover' => '@href';
				process '.tralbum-credits', 'released' => sub {
					my $val = $_->as_trimmed_text();
					$val =~ s/release[ds]\s*//;
					if ($val =~ m/(?<date>[A-Za-z]+\s+\d{1,2},\s+\d{4})$/) {
						return Time::Piece->strptime(unidecode($+{date}), '%B %d, %Y');
					}
				};
			}
		}
	);
	
	method TO_JSON() {
		return {
			band => $self->band,
			id => $self->id,
			cover => $self->cover,
			item_title => $self->item_title,
			band_name => $self->band_name,
			item_url => $self->item_url,
			tracks => $self->tracks,
			released => $self->released ? $self->released->datetime : undef
		};
	}
	
	method fetchAlbum() {
		$self->debug_msg("Fetching album " . $self->item_title . ' by ' . $self->band_name);
		$self->fetch($self->item_url);
		if (!$self->mech->success) {
			$self->debug_msg("Couldn't load");
			return undef;
		}
		
		$self->debug_msg('Album was from cache?');
		$self->debug_msg($self->mech->is_cached ? 'YES' : 'NO');
		
		my $results = $self->albumScraper->scrape($self->mech->content);
		$self->id($results->{album_id});
		$self->band_name($results->{artist_name});
		$self->tracks($results->{tracks});
		$self->item_title($results->{title});
		$self->released($results->{released});
		$self->cover($results->{cover});
		return 1;
	
	}
}

1;