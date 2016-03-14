#!/usr/bin/env perl
use strict;
use warnings;
use lib 'lib';
use Data::Printer;
use WRS;

my $wrs = new WRS();

my $episodes = $wrs->listEpisodesForSeason(2015, 2016);
p($episodes);

my $chunks = $wrs->getEpisodeChunkList($episodes->[0]->{id});

my $c_idx = 0;
foreach my $c (@$chunks) {
	print STDERR "Fetching $c\n";
	my $cmd = "wget -O ./data/tmp/chunk_" . sprintf('%04d', ++$c_idx) . ".ts '$c'";
	system($cmd);
}