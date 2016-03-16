#!/usr/bin/env perl
use strict;
use warnings;
use lib 'lib';
use Data::Printer;
use WRS;

my $wrs = new WRS();

my $episodes = $wrs->listEpisodesForSeason(2015, 2016);
#p($episodes);

foreach my $ep (@$episodes) {
	my $file = './data/' . $ep->{title} . '.mp4';
	if (-f $file) {
		print STDERR "Already have $ep->{title}\n";
	} else {
		$wrs->grabEpisode($ep->{id}, $file);
	}
}
#my $chunks = $wrs->getEpisodeChunkList($episodes->[1]->{id});
#
#my $c_idx = 0;
#foreach my $c (@$chunks) {
#	my $chunk_path = "./data/tmp/chunk_" . sprintf('%04d', ++$c_idx) . ".ts";
#	if (-f $chunk_path) {
#		print STDERR '.';
#	} else {
#		print STDERR "  Grabbing chunk $c_idx of " . scalar @$chunks . "\n";
#		my $cmd = "wget -nv -O $chunk_path '$c' 2>&1 > /dev/null";
#		system($cmd);
#		print STDERR "Done.";
#	}
#}