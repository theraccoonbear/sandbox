#!/usr/bin/env perl
use strict;
use warnings;
use Data::Printer;

my $cmd = $ARGV[0];
my $exitcode;
my $mod;
my $mod_counts = {};

do {
	my $alloutput = qx($cmd 2>&1);
	$exitcode = $? >> 8;

	if ($exitcode) {
		if ($alloutput =~ m/you may need to install the (?<module>[^\s:]+(::[^\s:]+)*) module/gi) {
			$mod = $+{module};
			print "Installing: $mod\n";
			$mod_counts->{$mod} += 1;
			system('sudo', 'cpanm', '-v', $mod);
		}
	}
} while ($exitcode && $mod_counts->{$mod} < 3);