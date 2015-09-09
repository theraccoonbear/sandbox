#!/usr/bin/env perl
use strict;
use warnings;
use Data::Printer;

my $start = $ARGV[0] || '8:15a';
my $end = $ARGV[1] || '6:00p';

sub parseTime {
    my $time = shift @_;
    my $def_mer = shift @_ || 'am';
    my $tm = {};
    if ($time =~ m/(?<hr>\d{1,2})(\:(?<mn>\d{2}))?\s*(?<mr>am?|pm?)?/i) {
        $tm->{hr} = 1 * $+{hr};
        $tm->{mn} = 1 * ($+{mn} || 0);
        my $mr = substr($+{mr} || $def_mer, 0, 1);
        if ($mr eq 'p') {
            $tm->{hr} += 12;
        }
        $tm->{time} = $tm->{hr} + ($tm->{mn} / 60);
        $tm->{formatted} = $tm->{hr} . ':' . sprintf('%02d', $tm->{mn});
    } else {
        die "Couldn't parse $time\n";
    }
    return $tm;
}

my $st = parseTime($start);
my $en = parseTime($end, 'pm');

print "From $st->{formatted} to $en->{formatted}\n";
print "elapsed: " . ($en->{time} - $st->{time}) . " hours\n";