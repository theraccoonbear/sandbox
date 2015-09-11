#!/usr/bin/perl
use strict;
use warnings;
use File::Slurp;
use JSON::XS;
use Data::Printer;

my $data = decode_json(read_file('sample.json'));
p($data);
