# == Class: other
#
# Install other support packages needed
#
class other {
  $packages = ['curl', 'vim', 'make', 'openjdk-7-jdk', 'git', 'zip', 'cpanminus', 'perl-doc']
  package { $packages:
    ensure  => present,
    require => Exec['apt-get update']
  }
}
