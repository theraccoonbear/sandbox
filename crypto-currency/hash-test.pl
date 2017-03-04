#!/usr/bin/env perl
use strict;
use warnings;
use Digest::MD5 qw(md5_hex md5);
use Digest::CRC qw(crc64 crc32 crc16 crcccitt crc crc8 crcopenpgparmor);
use Time::HiRes qw(gettimeofday tv_interval);
use Data::Printer;
use List::Util qw(reduce);

select((select(STDOUT), $|=1)[0]);
select((select(STDERR), $|=1)[0]);

sub get_ts {
	return [gettimeofday];
}

my $difficulty = 5;
my $target_interval = 10;
my $trailing_zero_count = 0;

my $data;
my $start_ts;
my $attempts;
my $nonce;
my $to_hash;
my $hashed;
my $hex_hash;
my $binary_hash;
my $hashes_per_second;
my $solution_intervals = [$target_interval];
my $average_interval;
my $window_size = 3;

while (1) {
	$data = "Hello, World!";
	$start_ts = get_ts();
	
	$attempts = 0;
	$trailing_zero_count = 0;
	while ($trailing_zero_count < $difficulty) {
		$nonce = 999999 * rand();
		$to_hash = $data . $nonce;
		$hashed = md5($to_hash);
		$binary_hash = join '', map { sprintf('%08d', sprintf('%b',  ord($_))); } split //, $hashed;
		$binary_hash =~ m/(?<trailing_zeros>0+)$/;
		$trailing_zero_count = length($+{trailing_zeros} || '');
		$attempts++;
		if ($attempts % 10000 == 0) {
			print '.';
		}
		
	}
	print "\n";
	my $interval = tv_interval($start_ts, get_ts);
	push @$solution_intervals, $interval;
	my $slice = (scalar @$solution_intervals - 1, $window_size)[scalar @$solution_intervals - 1 > $window_size];
	print scalar @$solution_intervals . "\n";
	print "$window_size\n";
	print "$slice\n";
	$average_interval = (reduce { $a + $b } (@$solution_intervals)[0..$slice]) / scalar ((@$solution_intervals)[0..$slice]);
	my $interval_delta = (($target_interval - $average_interval) / $target_interval) * 100;
	$hashes_per_second = $attempts / $interval;
	
	print "Data: $data\n";
	print "Nonce: $nonce\n";
	print "Hash: $hashed\n";
	print "Binary Hash: $binary_hash\n";
	print "Trailing Zeros: $trailing_zero_count\n";
	print "Difficulty: $difficulty\n";
	print "Solution Interval: $interval seconds\n";
	print "Attempts: $attempts\n";
	print "Hash Rate: " . sprintf('%0.1f', $hashes_per_second) . "/second\n";
	print "Average Interval: $average_interval seconds\n";
	print "Target Interval: $target_interval seconds\n";
	print "Deviation: " . sprintf('%0.1f', $interval_delta) . "\%\n";
	
	#p($solution_intervals);
	
	if ($interval_delta > 0.2) {
		$difficulty++;
		print "Difficulty adjusted UP to $difficulty\n";
	} elsif ($interval_delta < -0.2) {
		$difficulty--;
		print "Difficulty adjusted DOWN to $difficulty\n";
	} else {
		print "Difficulty OK. Remaining at $difficulty\n";
	}
}