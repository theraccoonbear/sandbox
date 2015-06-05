#!/usr/bin/env perl
use strict;
use warnings;
use File::Slurp;
use Data::Printer;

sub dbg {
	my $msg = shift;
	print STDERR $msg . "\n";
}

my $words = [map { [split(/\s{2}/, $_)]; } grep { /^g/i } split(/\n/, read_file('cmudict-0.7b.txt'))];

my $totals = {
	j => 0,
	g => 0,
	o => 0,
	all => 0
};

my $by_sound = {
	j => [],
	g => [],
	o => []
};

foreach my $w (@$words) {
	if ($w->[1] =~ m/^[ZJ]H/) {
		$totals->{j}++;
		push @{$by_sound->{j}}, $w;
	} elsif ($w->[1] =~ m/^G/) {
		$totals->{g}++;
		push @{$by_sound->{g}}, $w;
	} else {
		$totals->{o}++;
		push @{$by_sound->{o}}, $w;
	}
	$totals->{all}++;
}

p($by_sound->{o});

print "TOTALS:\n";
print "  J - $totals->{j} (" . ($totals->{j} / $totals->{all} * 100) . "%)\n";
print "  G - $totals->{g} (" . ($totals->{g} / $totals->{all} * 100) . "%)\n";
print "  O - $totals->{o} (" . ($totals->{o} / $totals->{all} * 100) . "%)\n";

