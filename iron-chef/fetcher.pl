#!/usr/bin/env perl
use strict;
use warnings;

use Data::Printer;

use CHI;
use WWW::Mechanize::Cached;
use Web::Scraper;

binmode STDOUT, ":utf8";

my $iron_chef_root = '/storage/media1/tv/Iron Chef/';
 
my $iron_chef_files = {};
if (-d $iron_chef_root) {
	opendir DFH, $iron_chef_root;
	my $seasons = [ map { $iron_chef_root . $_ } grep { /Season\s+\d+/ } readdir DFH ];
	closedir DFH;
	foreach my $season (@$seasons) {
		opendir DFH, $season;
		map {
			if ($_ =~ m/\bs(?<season>\d+)e(?<episode>\d+)\b/i) {
				my $sek = $+{season} . ':' . $+{episode};
				if (!$iron_chef_files->{$sek}) {
					$iron_chef_files->{$sek} = [];
				}
				push @{ $iron_chef_files->{$sek} }, $_;
			}
		} readdir DFH;
		closedir DFH;
	}
}
 
my $cache = CHI->new(
    driver   => 'File',
		expires_in => '1h',
    root_dir => '/tmp/mech-example'
);

my $mech = new WWW::Mechanize::Cached(cache => $cache);

my $index_url = 'http://ironcheffans.info/wordpress/?page_id=21';

my $index_scraper = scraper {
	process 'table[border="3"]', 'seasons[]' => scraper {
		process 'h3', 'number' => sub {
			my $season_num = 'XX';
			if ($_->as_trimmed_text =~ m/^(?<num>\d+)$/) {
				$season_num = $+{num} - 1992;
			}
			return $season_num;
		};
		process '//tr[count(td) = 5]', 'episodes[]' => scraper {
			process '//td[position() = 1]/a',
				orig_number => 'TEXT',
				number => sub {
					(my $num = $_->as_trimmed_text);
					if ($num =~ m/^\d+?(?<num>\d{2})(?<code>[a-z]*)$/i) {
						$num = 1 * $+{num};
					}
					return $num;
				},
				code => sub {
					my $code = '';
					if ($_->as_trimmed_text =~ m/^\d+?(?<num>\d{2})(?<code>[a-z]*)$/i) {
						$code = $+{code};
					}
					return $code;
				},
				url => sub {
					(my $url = $_->attr('href')) =~ s/act=view/act=download/;
					return $url;
				};
			process '//td[position() = 2]', 'date' => 'TEXT';
			process '//td[position() = 3]', 'ingredient' => 'TEXT';
			process '//td[position() = 4]', 'challenger' => 'TEXT';
			process '//td[position() = 5]', 'iron_chef' => 'TEXT';
		}
	};
};

my $resp = $mech->get($index_url);

my $scraper_cache_key = 'scraped:' . $index_url;
#$cache->expire($scraper_cache_key);
my $scraped = $cache->get($scraper_cache_key);
if (!$scraped) {
	$scraped = $index_scraper->scrape($mech->content);
	$cache->set($scraper_cache_key, $scraped);
}

my $results = $scraped->{seasons}; #[ grep { $_->{number} =~ m/^\d+$/ } @{ $scraped->{seasons} }];

my $new_seasons = [];
foreach my $season (@$results) {
	my $s_num = $season->{number};
	my $new_episodes = [];	
	foreach my $episode (@{ $season->{episodes}}) {
		if ($episode->{url}) {
			my $sek = $s_num . ':' . $episode->{number};
			my $files = $iron_chef_files->{$sek};
			#$episode->{files} = $files;
			
			if (!$files) {
				push @$new_episodes, $episode;
			}
		}
	}
	$season->{episodes} = $new_episodes;
	push @$new_seasons, $season;
}

#p($results);
p($new_seasons);
#p($iron_chef_files);

print STDERR "Cached? " . ($mech->is_cached ? 'YES' : 'NO') . "\n";
