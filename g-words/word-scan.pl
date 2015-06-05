#!/usr/bin/env perl
use strict;
use warnings;
use WWW::Mechanize;
use Wiktionary::Parser;
use Web::Scraper;
use URI::Encode;
use File::Slurp;
use Data::Printer;
use JSON::XS;

#my $mech = new WWW::Mechanize(autocheck => 0);
#my $uri = URI::Encode->new({encode_reserved => 0});
my $parser = Wiktionary::Parser->new();

sub dbg {
	my $msg = shift;
	print STDERR $msg . "\n";
}

my $ipa_scraper = scraper {
	process 'span.ipa', 'ipas[]' => 'TEXT';
};

my $words = [grep { /^g/i } split(/\n/, read_file('american-english'))];

my $cnt = 0;
foreach my $w (@$words) {
	$cnt++;
	#$w = lc($w);
	my $word_file = 'results/' . $w . '.json';
	if (! -f $word_file) {
		dbg "Searching $w";
		my $document = $parser->get_document(title => $w);
		if ($document) {
			my $pron = $document->get_pronunciations();
			if ($pron->{en}) {
				dbg $w;
				p($pron->{en}); #{pronunciation});
			}
		} else {
			dbg "No results";
		}
		
		#
		#	dbg "Scraping $w";
		#	my $results = $ipa_scraper->scrape($mech->content);
		#	p($results); 
		#	if ($results->{ipas}) {
		#		exit(0);
		#	} else {
		#		dbg "No results for $w"
		#	}
		#} else {
		#	dbg "Couldn't search $w";
		#}
	} else {
		dbg "$w already processed";
	}
}