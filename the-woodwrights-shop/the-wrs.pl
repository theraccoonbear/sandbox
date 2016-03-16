#!/usr/bin/env perl
use strict;
use warnings;
use lib 'lib';
use Data::Printer;
use WRS;

my $wrs = new WRS();

my $episodes = $wrs->listEpisodesForSeason(2015, 2016);
#p($episodes);

$wrs->grabEpisode($episodes->[2]->{id}, './data/' . $episodes->[2]->{title} . '.mp4');

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