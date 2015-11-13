#!/usr/bin/env perl
use strict;
use warnings;
use File::Slurp;
use YAML qw(LoadFile);
use Data::Printer;

my $file = 'shed-yuul.yml';
my $data = LoadFile($file);
p($data);
