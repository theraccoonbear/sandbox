#!/usr/bin/perl
use strict;
use warnings;
use Data::Printer;
use File::Slurp;
use JSON::XS;
use Net::NNTP;

my $cfg = decode_json(read_file('config.json'));

my $nntp = new Net::NNTP($cfg->{hostname});
$nntp->list();
p($nntp);
