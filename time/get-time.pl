#!/usr/bin/env perl
use strict;
use warnings;
use File::Slurp;
use JSON::XS;
use Data::Printer;
use Cwd qw(abs_path realpath);
use FindBin;
use File::Basename;
use lib dirname(abs_path($0));

use WebService::Harvest;
use Time::DayOfWeek qw(:dow);
use DateTime::Format::Strptime;

my $cfg_file = dirname(abs_path($0)) . '/config.json';

if (! -f $cfg_file) {
    (my $cfg_tmpl = $cfg_file) =~ s/\.json/\.example.json/;
    print "You don't have a config.json file!  I've copied config.sample.json as a starting template.\n\n";
    `cp '$cfg_tmpl' '$cfg_file'`;
    exit(0);
}

my $cfg = decode_json(read_file($cfg_file));

my $daily_std = $cfg->{daily_standard_hours} || 7.84615384615;
my $daily_target = $cfg->{daily_target_hours} || 8.5;

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
my $est_hours = 0;
if ($entries->success) {
    map {
        (my $d = $_->{day_entry}->{spent_at}) =~ s/[^\d]+//g;
        if ($d ne $e_date) {
            $est_hours += $_->{day_entry}->{hours};
        }
        $hours_worked += $_->{day_entry}->{hours};
    } @{ $entries->{data} };
}

my $strp = DateTime::Format::Strptime->new(
    #pattern => '%m/%d/%Y'
    pattern => '%Y%m%d'
);

# convert date to 
my $dt = $strp->parse_datetime($s_date);
my $dt_str;
my $hours_needed = 0;
my $work_days = 0;
do {
    $dt = $dt->add(days => 1);
    $dt_str = $dt->strftime("%Y%m%d");
    my $dow = DayOfWeek($dt->year, $dt->month, $dt->day);
    $est_hours += ($dt_str eq $e_date && $dow !~ m/^(Sat|Sun)/) ? $daily_target : 0;
    
    $hours_needed += ($dow =~ m/^(Sat|Sun)/) ? 0 : $daily_std;
    $work_days += ($dow =~ m/^(Sat|Sun)/) ? 0 : 1;
    
} while ($dt_str ne $e_date);

my $delta = sprintf('%0.2f', $hours_worked - $hours_needed);
my $est_delta = sprintf('%0.2f', $est_hours - $hours_needed);
$hours_needed = sprintf('%0.2f', $hours_needed);
$hours_worked = sprintf('%0.2f', $hours_worked);
my $avg_hours_per_work_day = sprintf('%0.2f', $hours_worked / $work_days);
my $est_avg_hours_per_work_day = sprintf('%0.2f', $est_hours / $work_days);

my $disp_daily_std = sprintf('%0.2f', $daily_std);
my $disp_daily_target = sprintf('%0.2f', $daily_target);

print <<__TIME;
HARVEST TIME REPORT:
    Work Days: $work_days
    
    Avg Hours/Day: $avg_hours_per_work_day
    Est Hours/Day: $est_avg_hours_per_work_day
    Tgt Hours/Day: $disp_daily_target
    Std Hours/Day: $disp_daily_std
    
    Needed: $hours_needed hours
    Worked: $hours_worked hours
    Accrued: $delta hours
    Est Accrued: $est_delta hours

__TIME
