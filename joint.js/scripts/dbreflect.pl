#!/usr/bin/perl
use strict;
use warnings;
use Data::Printer;
use DBI;
 
my $dsn = "DBI:mysql:database=test_db;host=localhost;port=3306";

my $user = 'testuser';
my $password = 'password';

my $dbh = DBI->connect($dsn, $user, $password);

my $sql = '';
$sql = 'SHOW tables IN test_db;';

my $schema = {
  meta => {},
  tables => {}
};

my $sth = $dbh->prepare($sql);
$sth->execute();
while (my $row = $sth->fetchrow_hashref()) {
  #p($row->{Tables_in_test_db});
  my $table = $row->{Tables_in_test_db};
  print "Inspecting \"$table\"...\n";
  my $dt_sql = "DESCRIBE `$table`;";
  my $t_sth = $dbh->prepare($dt_sql);
  $t_sth->execute();
  my $table_shape = $t_sth->fetchall_arrayref();
  my $columns = {};
  foreach my $col (@{ $table_shape }) {
    $columns->{$col->[0]} = $col->[1];
  }
  $schema->{tables}->{$table} = $columns;
}
p($schema);
#my @ts = sort keys %{ $schema->{tables} };
#p(@ts)

foreach my $tbl_name (keys %{ $schema->{tables}}) {
  my $table = $schema->{tables}->{$tbl_name};
  
}