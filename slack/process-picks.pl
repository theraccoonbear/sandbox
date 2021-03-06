#!/usr/bin/env perl
use strict;
use warnings;

use v5.10;

our $VERSION = 0.1;

use utf8;
use Spreadsheet::XLSX;
use Text::Unidecode;
use List::Util qw(min max sum);
use Data::Printer;
use Getopt::Long;

sub makeSlug {
  my ($art, $alb) = @_;

  $art = unidecode(lc($art));
  $art =~ s/[^a-z0-9]+/_/gxsm;
  $alb = unidecode(lc($alb));
  $alb =~ s/[^a-z0-9]+/_/gxsm;
  return "$art-$alb";
}

sub showUsage {
  my ($msg) = @_;

  print STDERR <<__USAGE;
EOY List Picks Processor

./process-picks.pl --source <source.xlsx>
__USAGE

  if ($msg) {
    say STDERR $msg;
  }
}

my $source;
my $skip = 0; # rows to skip
GetOptions (
  "source=s" => \$source,
  "skip=i" => \$skip
) or die("Error in command line arguments\n");

if (!$source || ! -f $source) {
  showUsage('Cannot find source or none specified');
  exit 1;
}


my $MAX_RECORDS = 10;
my $scores = {};

my $excel = Spreadsheet::XLSX->new($source);
my $user_data = {};
my $users_who_rated = 0;
foreach my $sheet (@{ $excel->{Worksheet} }) {
  $sheet->{MaxRow} ||= $sheet->{MinRow};
  my $username = $sheet->{Name};
  if ($username !~ /^_/) {
    my $user = {
      raw => $sheet,
      by_slug => {}
    };
    $user_data->{$username} = $user;
    $users_who_rated++;
    foreach my $row ($skip..$MAX_RECORDS + $skip- 1) {
      my $rank = $sheet->{Cells}[$row][0]->{Val};
      my $artist = $sheet->{Cells}[$row][1]->{Val};
      my $album = $sheet->{Cells}[$row][2]->{Val};
      
      if ($rank && $artist && $album) {
        my $slug = makeSlug($artist, $album);
        my $score = ($MAX_RECORDS - $rank) + 1;
        $user->{by_slug}->{$slug} = $score;
        if (!$scores->{$slug}) {
          $scores->{$slug} = {
            points => 0,
            sources => [],
            artist => $artist,
            album => $album
          };
        }
        $scores->{$slug}->{points} += $score;
        push @{ $scores->{$slug}->{sources} }, $score;
      }
    }
  }
}

my $total_votes_cast = 0;
my $total_ratings = 0;

foreach my $slug (keys %{ $scores }) {
  # count votes for release
  $scores->{$slug}->{votes_for_item} = scalar @{ $scores->{$slug}->{sources} };
  # sum votes for release
  $scores->{$slug}->{total_score_for_item} = sum(@{ $scores->{$slug}->{sources} });
  # running total of votes
  $total_votes_cast += $scores->{$slug}->{votes_for_item};
  # running total of sums
  $total_ratings += $scores->{$slug}->{total_score_for_item};
  # average (mean) rating for release
  $scores->{$slug}->{average_rating} = $scores->{$slug}->{total_score_for_item} / $scores->{$slug}->{votes_for_item};
}

# sum average rating across releases and divide by total numer of distinct releases voted on
my $total_average_rating = sum(map { $scores->{$_}->{average_rating} } keys %{ $scores }) / scalar keys %{ $scores };
my $average_number_votes_total = $total_votes_cast / scalar keys %{ $scores };

foreach my $slug (keys %{ $scores }) {
  my $item = $scores->{$slug};
  $scores->{$slug}->{bayesian_weighted_rank} = 
    ( ($average_number_votes_total * $total_average_rating) + ($item->{votes_for_item} * $item->{total_score_for_item}) ) /
    ($average_number_votes_total + $item->{votes_for_item});
}

my $count = 0;

#my $sort_by = 'points';
my $sort_by = 'bayesian_weighted_rank';

my $usernames = join(", ", map { '@' . $_ } keys %{$user_data});

say <<"__STUFF";
  *Total Votes Cast:* $total_votes_cast
  *Total Ratings:* $total_ratings
  *Avg Rating Total:* $total_average_rating
  *Avg Votes Total:* $average_number_votes_total
  *Users Who Voted:* $users_who_rated
  *Voting Users:* $usernames
__STUFF

# say "Sorting by '$sort_by'";

foreach my $slug (sort { 
  $scores->{$b}->{$sort_by} <=> $scores->{$a}->{$sort_by}
} keys %{$scores}) {
  my $rel = $scores->{$slug};
  $rel->{average} = $rel->{points} / scalar @{ $rel->{sources} };
  $count++;
  say sprintf '%2s. *%s* - _%s_ %.01f/10 (%s votes; %.01f)', $count, $rel->{artist}, $rel->{album}, $rel->{average_rating}, $rel->{votes_for_item}, $rel->{$sort_by};
}
