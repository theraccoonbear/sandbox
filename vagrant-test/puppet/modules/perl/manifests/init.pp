class perl {

  include cpanm
  
  package { 'JSON::XS': ensure => present, provider => cpanm }
  package { 'Data::Printer': ensure => present, provider => cpanm }
  package { 'File::Slurp': ensure => present, provider => cpanm }
}