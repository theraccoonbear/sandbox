use Moose;
use Moops;

use lib '..';

class BC::Artist extends BC {
  use Data::Printer;
	use Web::Scraper;
	use URI::Escape;
	use Text::Unidecode;
  use Encode qw(encode_utf8 decode_utf8);
	use POSIX;
  
  has 'artistScraper' => (
    is => 'ro',
    isa => 'Web::Scraper',
    default => sub {
      my $scraper = scraper {
        process '#', 'name' => 'TEXT';
      };
      return $scraper;
    }
  );
  
  
  method fetchArtist() {

    my $url = $self->base_url . $self->user;
    $self->fetch($url);
    if ($self->mech->success) {
      #return $self->collectionScraper->scrape($self->mech->content);
      if ($self->mech->content =~ m/var\s*CollectionData\s*=\s*(?<json>\{.+?\});/gism) {
        my $udec = unidecode($+{json});
        my $collection = $self->json->decode($udec);
        my $col = [];
        my $wsh = [];
        foreach my $item_id (keys %{ $collection->{item_details} }) {
          my $item = $collection->{item_details}->{$item_id};
          if ($item->{sale_item_id} ne '') {
            push @{ $self->collection }, $item;
          } else {
            push @{ $self->wishlist}, $item;
          }
        }
        return {
          collection => $self->collection,
          wishlsit => $self->wishlist
        };
      } else {
        die "D'oh!";
      }
    } else {
      die "Oh noes!";
    }
  }
}

1;