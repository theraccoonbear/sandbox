#!/usr/bin/perl
use strict;
use warnings;
use File::Slurp;
use YAML::XS qw(Load);
use Data::Dumper;
use Data::Printer;


my $raw = read_file('../sql/schema.yml');
my $config = Load($raw);

my $field_quote_char = lc($config->{Settings}->{db_type}) eq 'pg' ? '' : '`';

sub drill {
	my $obj = shift @_;
	my $key =shift @_;
	my $def = shift @_ || '';
	$key = [split(/\./, $key)];
	my $ret = $def;
	my $c_key = shift @$key;
	while (scalar @$key > 0 && defined $obj->{$c_key}) {
		$obj = $obj->{$c_key};
		$c_key = shift @$key;
	}
	
	if (scalar @$key == 0 && defined $obj->{$c_key}) {
		$ret = $obj->{$c_key};
	}
	
	return $ret;
}

sub metaFromName {
	my $f = shift @_;
	
	if (!$f->{name}) {
		return {};
	}
	
	
	my $name = lc($f->{name});
	my $ret = {
		type => 'VARCHAR(255)',#$f->{index} ? 'VARCHAR(255)' : 'TEXT',
		opts => lc($config->{Settings}->{db_type}) eq 'pg' ? [] : ['NOT NULL'],
		def => ""
	};
	
	
	@$ret{keys %$f} = values %$f;
	
	
	if ($name eq 'id') {
		if (lc($config->{Settings}->{db_type}) eq 'pg') {
			$ret->{type} = 'SERIAL';
			$ret->{opts} = ['PRIMARY KEY'];
		} else {
			$ret->{type} = 'int(10)';
			$ret->{opts} = ['unsigned', 'NOT NULL', 'AUTO_INCREMENT'];
		}
		delete $ret->{def};
	} elsif (defined $f->{type} && $f->{type} =~ m/^(?<table>[A-Za-z0-9_]+)\.id/) {
		if (lc($config->{Settings}->{db_type}) eq 'pg') {
			 $f->{type} = 'integer';
			 $ret->{type} = 'integer';
			 $ret->{meta} = {ref => $+{table}};
			 $ret->{opts} = ['REFERENCES', $+{table} . 's', '(id)'];
			 $ret->{def} = undef;
		} else {
			$f->{type} = 'INT(10)';
			$ret->{type} = 'int(10)';
			$ret->{meta} = {ref => $+{table}};
			$ret->{def} = '0';
		}
	} elsif ($name =~ m/(?<name>created|modified|date)/) {
		if ($+{name} eq 'modified') {
			$ret->{def} = '1970-01-01 00:00:01';
		} else {
			delete $ret->{def};
		}
		
		$ret->{index} = 1;
		
		if (lc($config->{Settings}->{db_type}) eq 'pg') {
			$ret->{type} = 'TIMESTAMP WITH TIME ZONE';
		} else {
			$ret->{type} = 'DATETIME';
		}
	} elsif(defined $f->{type} && lc($f->{type}) eq 'time') {
		$ret->{def} = $f->{def} || "00:00:00";
	} elsif ($name eq 'archived') {
		$ret->{def} = '0';
	} elsif (defined $f->{type} && $f->{type} =~ m/^int\(/) {
		$ret->{def} = '0';
	}
	
	if (lc($config->{Settings}->{db_type}) eq 'pg') {
		if ($ret->{type} =~ m/^int\(/i) {
			$ret->{type} = 'integer';
		}
	}
	
	
	
	$ret->{type} = uc($ret->{type});
	
	return $ret;
}


#print Dumper($config);;

my $fields_all = drill($config, 'Fields All', []);

my $tables = drill($config, 'Tables', []);

my $schema = [];

my $mbu = {};

foreach my $t (@$tables) {
	#my $table = $tables->[$t];
	#print Dumper($t);
	my $t_name = $t->{Name};
	my $fields = [];
	my $indices = [];
	
	my $exclude = {};
	
	foreach my $f (@{$t->{Fields}}) {
		if ($f->{exclude}) {
			$exclude->{$f->{exclude}} = 1;
		}
		
	}
	
	
	foreach my $fa (@$fields_all) {
		my $found = 0;
		foreach my $f (@{$t->{Fields}}) {
			if ($f->{name} && lc($f->{name}) eq lc($fa->{name})) {
				$found = 1;
				last;
			}
		}
		if (!$found && !$exclude->{$fa->{name}}) {
			push @{$t->{Fields}}, $fa;
		}
	}
	
	foreach my $f (@{$t->{Fields}}) {
		if ($f->{name}) {
			my $name = $f->{name};
		
			
			my $meta = metaFromName($f);
			my $type = $meta->{type};
			my $def = (defined $f->{def} ? ("'" . $f->{def} . "'") : undef) || (defined $meta->{def} ? ("'" . $meta->{def} . "'") : undef) || undef;
			
			
			#print "$name = " . Dumper($meta);
			my $parts = [$field_quote_char . $name . $field_quote_char, $type];
			if ($meta->{opts}) {
				push @$parts, join(' ', @{$meta->{opts}});
			}
			if ($def) {
				#if ($def eq "'[]'") {
				#	$def = '[]';
				#}
				push @$parts, 'DEFAULT ' . $def;
			}
			
			if (lc($name) eq 'id') {
				push @$indices, {
					type => 'PRIMARY',
					name => $name
				};
			} elsif ($meta->{index}) {
				push @$indices, {
					type => $f->{'unique'} ? 'UNIQUE' : '',
					name => $name
				};
			}
			
			
			
			push @$fields, join(' ', @$parts);
		}
	}

	
	#print Dumper($fields);
	@$fields = sort {
		my $ret = 0;
		if ($a =~ m/^id\b/) {
			$ret = -1;
		} elsif ($b =~ m/^id\b/) {
			$ret = 1;
		} elsif ($a =~ m/(created|modified|archived|order)/) {
			$ret = 1;
		} elsif ($b =~ m/(created|modified|archived|order)/) {
			$ret = -1;
		} else {
			$ret = $a cmp $b;
		}
		return $ret;
	} @$fields;
	#print Dumper($fields);
	
	$fields = join(",\n  ", @$fields);
	my $index = '';
	my $after_table = '';
	if (lc($config->{Settings}->{db_type}) eq 'pg' && scalar @$indices > 0) {
		if (0) {
			$after_table .= join(";\n", map { "CREATE INDEX $field_quote_char" . $_->{name} . "_idx$field_quote_char ON $t_name($field_quote_char$_->{name}$field_quote_char)" } sort { $a->{type} eq 'PRIMARY' ? -1 : $b->{type} eq 'PRIMARY' ? 1 : $a->{name} cmp $b->{name} } @$indices) . ";\n";
		}
	} else {
		$index .= scalar @$indices > 0 ? ",\n\n  " : '';
		$index .= join(",  \n  ", map {(length($_->{type} || '') > 0 ? ($_->{type} . ' ') : '') . "KEY $field_quote_char" . $_->{name} . "_key$field_quote_char ($field_quote_char$_->{name}$field_quote_char)" } sort { $a->{type} eq 'PRIMARY' ? -1 : $b->{type} eq 'PRIMARY' ? 1 : $a->{name} cmp $b->{name} } @$indices);
	}
	
	
	my $table_opts = lc($config->{Settings}->{db_type}) eq 'pg' ? '' : " ENGINE=MyISAM DEFAULT CHARSET=utf8";
	my $drop_opt = lc($config->{Settings}->{db_type}) eq 'pg' ? ' CASCADE' : '';
	
	my $table_def = <<__SQL;
DROP TABLE IF EXISTS $field_quote_char$t_name$field_quote_char$drop_opt;
CREATE TABLE $field_quote_char$t_name$field_quote_char (
  ${fields}${index}
)$table_opts;
$after_table

__SQL
	
	push @$schema, $table_def;
	
}




write_file('../sql/schema.sql', join("\n", @$schema));