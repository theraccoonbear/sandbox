#!/usr/bin/env perl
use strict;
use warnings;
use File::Slurp;
use JSON::XS;
use Data::Printer;
use WebService::Harvest;
use Time::DayOfWeek qw(:dow);
use DateTime::Format::Strptime;

my $cfg = decode_json(read_file('config.json'));

my $harvest = new WebService::Harvest(config => $cfg);

my $start_date = {
    year => 2015,
    month => 8,
    day => 1
};

my $today = [localtime];

my $end_date = {
    year => $today->[5] + 1900,
    month => $today->[4] + 1,
    day => $today->[3]
};

my $s_date = sprintf('%04d', $start_date->{year}) . sprintf('%02d', $start_date->{month}) . sprintf('%02d', $start_date->{day});
my $e_date = sprintf('%04d', $end_date->{year}) . sprintf('%02d', $end_date->{month}) . sprintf('%02d', $end_date->{day});

my $entries = $harvest->getEntries($s_date, $e_date);

my $hours_worked = 0;
if ($entries->success) {
    map { $hours_worked += $_->{day_entry}->{hours}; } @{ $entries->{data} };
}

my $strp = DateTime::Format::Strptime->new(
    #pattern => '%m/%d/%Y'
    pattern => '%Y%m%d'
);

# convert date to 
my $dt = $strp->parse_datetime($s_date);
my $dt_str;
my $hours_needed = 0;
do {
    $dt = $dt->add(days => 1);
    $dt_str = $dt->strftime("%Y%m%d");
    my $dow = DayOfWeek($dt->year, $dt->month, $dt->day);
    $hours_needed += ($dow =~ m/^(Sat|Sun)/) ? 0 : 8;
} while ($dt_str ne $e_date);

my $delta = $hours_needed - $hours_worked;
print <<__TIME;
  Worked: $hours_worked
  Needed: $hours_needed
  Short: $delta
__TIME
