#!/usr/bin/env perl
use strict;
use warnings;
use WWW::Mechanize;
use Web::Scraper;
use File::Slurp;
use YAML::XS;
use Data::Printer;

my $yml = read_file('my-scraper.yml');
p($yml);
my $scr = Load($yml);
p($scr); exit(0);

my $mech = new WWW::Mechanize(
    autocheck => 0,
    agent => 'MyMech/1.0',
    cookie_jar => {} 
);

$mech->get('https://news.ycombinator.com/');
if ($mech->success) {
    my $cont = $mech->content();
}
