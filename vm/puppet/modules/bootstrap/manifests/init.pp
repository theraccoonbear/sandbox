# == Class: bootstrap
#
# Ensure puppet will work and update apt
#
class bootstrap {
  # this makes puppet and vagrant shut up about the puppet group
  group { 'puppet':
    ensure => 'present'
  }

  # make sure the packages are up to date before beginning
  exec { 'apt-get update':
    command => 'sudo /usr/bin/apt-key update && sudo /usr/bin/apt-get -y update'
  }
  
  package { 'python-software-properties':
    ensure => present,
    require => Exec['apt-get update']
  }
  
  exec { 'apt-get upgrade':
    command => 'sudo /usr/bin/apt-get -y upgrade',
	require => [
      Exec['apt-get update']
    ]
  }
}
