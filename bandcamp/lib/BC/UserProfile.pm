package BC::UserProfile;

use Moose;

extends 'BC';

use FindBin;
use lib "$FindBin::Bin/..";

use BC::Album;

use Data::Printer;
use URI::Escape;
use Text::Unidecode;
use Encode qw(encode_utf8 decode_utf8);
use POSIX;

has 'user' => (
	is => 'rw',
	isa => 'Str'
);

has 'wishlist' => (
	is => 'rw',
	isa => 'ArrayRef',
	default => sub { return []; }
);

has 'collection' => (
	is => 'rw',
	isa => 'ArrayRef',
	default => sub { return []; }
);

has '+cache_age' => (
	default => '1 day'
);

sub TO_JSON() {
	my $self = shift;
	return {
		collection => $self->collection,
		wishlist => $self->wishlist
	};
}


sub pullCollection() {
	my $self = shift;
	my $url = $self->base_url . $self->user;
	$self->debug_msg('Loading profile for ' . $self->user);
	$self->fetch($url);
	
	# clear the old lists
	$self->collection([]);
	$self->wishlist([]);
	
	my $c = {
		collection => [],
		wishlist =>[]
	};
	
	
	if (!$self->mech->success) {
		$self->debug_msg('error');
		return $c;
	}
	$self->debug_msg('OK');
	
	# hold on to yr butts!
	if ($self->mech->content !~ m/var\s*CollectionData\s*=\s*(?<json>\{.+?\});/gism) {
		$self->debug_msg("Couldn't find collection data");
		return $c;
	}
	
	$self->debug_msg("Building collection...");
	
	my $collection = $self->json->decode($+{json});
	foreach my $item_id (keys %{ $collection->{item_details} }) {
		my $item = $collection->{item_details}->{$item_id};
		$item->{debug} = $self->debug;
		if (!$item->{is_private} && $item->{tralbum_type} eq 'a') {
			my $album = new BC::Album($item);
			if (defined $item->{sale_item_id} && $item->{sale_item_id} ne '') {
				push @{ $self->collection }, $album;
			} else {
				push @{ $self->wishlist}, $album;
			}
		}
	}
	$self->debug_msg("OK. " . (scalar @{$self->collection}) . ' purchases & ' . (scalar @{$self->wishlist}) . ' wishlist items.');
	$c->{collection} = $self->collection;
	$c->{wishlist} = $self->wishlist;
	return $c;
}

1;
