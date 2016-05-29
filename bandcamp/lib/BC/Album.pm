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
    isa => 'Int',
    alias => 'item_id'
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
  
  has 'albumScraper' => (
    is => 'rw',
    isa => 'Web::Scraper',
    default => sub {
      return scraper {
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
    $self->band_name($results->{artist_name});
    $self->tracks($results->{tracks});
    $self->item_title($results->{title});
    $self->released($results->{released});
    return 1;
  
  }
}

1;