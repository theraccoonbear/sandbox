#!/usr/bin/env perl
use strict;
use warnings;
use lib 'lib';
use Data::Printer;
use WRS;

my $wrs = new WRS();

my $episodes = $wrs->listEpisodesForSeason(2015, 2016);
p($episodes);

$wrs->getEpisodeChunkList($episodes->[0]->{id});

#http://www.pbs.org/woodwrightsshop/lunchbox_plugins/merlin_plugin/video_frame/2365554420/