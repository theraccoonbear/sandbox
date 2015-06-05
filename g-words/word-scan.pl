#!/usr/bin/env perl
use strict;
use warnings;
use File::Slurp;
use Data::Printer;

my $s = {j => [], g => [], o => []};
my $words = [map { my $w = [split(/\s{2}/, $_)]; my $p = 'o'; if ($w->[1] =~ m/^[ZJ]H/) { $p = 'j'; } elsif ($w->[1] =~ m/^G/) { $p = 'g' }; push @{$s->{$p}}, $w; } grep { /^g/i } split(/\n/, read_file('cmudict-0.7b.txt'))];

print "The Odd Ones:\n";
p($s->{o});

print "TOTALS:\n";
print "  J Sound - " . (scalar @{$s->{j}}) . " (" . ((scalar @{$s->{j}}) / (scalar @$words) * 100) . "%)\n";
print "  G Sound - " . (scalar @{$s->{g}}) . " (" . ((scalar @{$s->{g}}) / (scalar @$words) * 100) . "%)\n";
print "    Other - " . (scalar @{$s->{o}}) . " (" . ((scalar @{$s->{o}}) / (scalar @$words) * 100) . "%)\n";

