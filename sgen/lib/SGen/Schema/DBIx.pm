use Moops;

class SGen::Schema::DBIx extends SGen::Schema {
	use Data::Printer;
	use autobox::String::Inflector;
	
	has 'files' => (
		is => 'rw',
		isa => 'HashRef',
		default => sub {
			return {};
		}
	);
	
	method generate() {
		$self->generateBaseSchema();
		$self->generateTables();
	}
	
	method generateBaseSchema() {
		$self->files->{$self->schemaName->camelize . '/Schema.pm'} = $self->render('DBIx_Class/schema.txt', {schemaName => $self->schemaName->camelize});
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
		return $table->DBIx();
	}
}

return 1;