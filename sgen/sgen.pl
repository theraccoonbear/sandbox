#!/usr/bin/env perl
use strict;
use warnings;
use Data::Printer;
use Getopt::Long;
use FindBin;
use lib "$FindBin::Bin/lib";

use SGen;

my $base_path = "$FindBin::Bin/generated";
my $generators = ['DBIx', 'SQL'];
GetOptions (
	'base_path|path|p=s' => \$base_path,
	'generator|g=s' => $generators
);

my $sgen = new SGen(file => 'schemas/recithieves.yml');
$sgen->parse();
$sgen->generate($generators);