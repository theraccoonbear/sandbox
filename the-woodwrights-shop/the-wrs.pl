#!/usr/bin/env perl
use strict;
use warnings;
use lib 'lib';
use File::Slurp;
use JSON::XS;
use Data::Printer;
use Text::Unidecode;
use Getopt::Long;
use WRS;

my $config = {};

if (-f 'config.json') {
	$config = decode_json(read_file('config.json'));
}

my $wrs = new WRS($config);

my $init_year = 2009;

GetOptions(
	'year=i' => \$init_year
);

p($init_year);
die;

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