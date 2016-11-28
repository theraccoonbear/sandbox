use Moops;

class SGen::Structure::Table extends SGen::Structure {
		
	use Data::Printer;
	
	has 'parent' => (
		is => 'rw',
		isa => 'SGen::Schema'
	);
	
	has 'fields' => (
		is => 'rw',
		isa => 'ArrayRef',
		default => sub {
			return [];
		}
	);
	
	has 'has_many' => (
		is => 'rw',
		isa => 'ArrayRef',
		default => sub {
			return [];
		}
	);
	
	method regularColumns {
		return [grep { ! $_->unique } @{ $self->fields }];
	}
	
	method BUILD {
		my $new_fields = [];
		
		foreach my $f (@{ $self->fields }) {
			if (!ref($f) || !eval {$f->can('can')}) {
				$f->{parent} = $self;
				push @$new_fields, new SGen::Structure::Field($f);
			} else {
				push @$new_fields, $f;
			}
		}
		
		$self->fields($new_fields);
	}
	
	method DBType() {
		return $self->parent->DBType();
	}
	
	method sql() {
		my $sql = [];
		push @$sql, "DROP TABLE IF EXISTS " . $self->fullName . " CASCADE;";
		push @$sql, "CREATE TABLE " . $self->fullName . " (";
		
		my $field_sql = [];
		foreach my $field (
			sort {
				my $ret = 0;
				if ($a->name =~ m/^id\b/) {
					$ret = -1;
				} elsif ($b->name =~ m/^id\b/) {
					$ret = 1;
				} elsif ($a->name =~ m/(created|modified|archived|order)/) {
					$ret = 1;
				} elsif ($b->name =~ m/(created|modified|archived|order)/) {
					$ret = -1;
				} else {
					$ret = $a->name cmp $b->name;
				}
				return $ret;
			} @{$self->{fields}}) {
			push @$field_sql, $field->sql;
		}
		
		
		push @$sql, join(",\n", @$field_sql);
		push @$sql, ");";
		return join("\n", @$sql);
	}
	
	method DBIx() {
	}
	
	method fullName {
		if ($self->DBType eq 'pg') {
			my $np = [];
			if (defined $self->parent->schema->{settings}->{schema}) {
				push @$np, $self->parent->schema->{settings}->{schema};
			}
			push @$np, $self->name;
			return '"' . join('"."', @$np) . '"';
		} else {
			return $self->name;
		}
		
	}
	
	method addDescendent(SGen::Structure::Field $field) {
		push @{ $self->has_many }, $field;
	}
}

1;