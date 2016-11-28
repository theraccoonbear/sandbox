#!/usr/bin/env perl
use strict;
use warnings;
use lib 'lib';
use Data::Printer;
use Text::Unidecode;
use WRS;

my $wrs = new WRS();

my $init_year = 2016;
my $episodes = $wrs->listEpisodesForSeason($init_year, $init_year + 1);

my $season_num = $init_year - 1980;
my $ep_num = 0;
foreach my $ep (@$episodes) {
	$ep_num++;
	$ep->{title} = unidecode($ep->{title});
	my $file = sprintf('./data/The Woodwright\'s Ships - s%02de%02d - %s.mp4', $season_num, $ep_num, $ep->{title});
	print STDERR "Grabbing $file...\n";
	$wrs->grabEpisode($ep->{id}, $file);
}