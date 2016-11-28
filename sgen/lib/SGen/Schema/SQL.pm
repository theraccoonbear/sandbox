use Moops;

class SGen::Schema::SQL extends SGen::Schema {
	use Data::Printer;
	use autobox::String::Inflector;
	
	method generate() {
		my $sql = [];
		if ($self->schema->{settings}
				&& $self->schema->{settings}->{schema}) {
			push @$sql, 'CREATE SCHEMA IF NOT EXISTS ' . $self->schema->{settings}->{schema} . ';';
		}
		push @$sql, $self->generateTables();
		
		return join("\n\n", @$sql);
	}
	
	method generateTables() {
		my $tables = [];
		
		
		foreach my $table (@{$self->tables}) {
			push @$tables, $self->generateTable($table->{name});
		}
		
		return join("\n\n", @$tables);
	}
	
	method generateTable($table_name) {
		my $table = $self->getTableByName($table_name);
		return $table->sql();
	}
}

return 1;