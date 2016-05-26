use Moose;
use Moops;

class BC::UserProfile {
  use Data::Printer;
	use WWW::Mechanize;
	use WWW::Mechanize::Cached;
	use Web::Scraper;
	use CHI;
	use URI::Escape;
	use Text::Unidecode;
  use Encode qw(encode_utf8 decode_utf8);
	#use JSON::XS;
  use JSON::PP;
	use POSIX;
	
  has 'base_url' => (
    is => 'rw',
    isa => 'Str',
    default => 'https://bandcamp.com/'
  );
  
  has 'user' => (
    is => 'rw',
    isa => 'Str'
  );
  
	has 'mech' => (
		is => 'rw',
		isa => 'WWW::Mechanize::Cached',
		default => sub {
			#my $m = new WWW::Mechanize::Cached(
			my $m = new WWW::Mechanize::Cached(
				agent => 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.87 Safari/537.36',
				autocheck => 1
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
  
  has 'collectionScraper' => (
    is => 'ro',
    isa => 'Web::Scraper',
    default => sub {
      my $scraper = scraper {
        process '#collection-items li.collection-item-container', 'items[]' => scraper {
          process '.collection-item-title', 'title' => sub {
            my $t = $_->as_trimmed_text();
            $t =~ s/ \(gift given\)//gi;
            return $t;
          };
          process '.collection-item-artist', 'artist' => sub {
            my $t = $_->as_trimmed_text();
            $t =~ s/^by //gi;
            return $t;
          };
        };
      };
    }
  );
  
  method pullCollection() {

    my $url = $self->base_url . $self->user;
    $self->mech->get($url);
    if ($self->mech->success) {
      #return $self->collectionScraper->scrape($self->mech->content);
      if ($self->mech->content =~ m/var\s*CollectionData\s*=\s*(?<json>\{.+?\});/gism) {
        my $udec = unidecode($+{json});
        return $self->json->decode($udec);
      } else {
        die "D'oh!";
      }
    } else {
      die "Oh noes!";
    }
  }
}