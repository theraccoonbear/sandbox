#!/bin/bash

# To get dbicdump...
# sudo cpanm -v DBIx::Class::Schema::Loader

dbicdump -o dump_directory=.. -o components='["InflateColumn::DateTime"]' Recithieves::Schema 'dbi:Pg:database=recithieves'