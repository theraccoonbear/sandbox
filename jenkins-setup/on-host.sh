#!/bin/bash

JENKINS_ROOT=https://pkg.jenkins.io/redhat-stable/
JENKINS_REPO=${JENKINS_ROOT}jenkins.repo
JENKINS_KEY=${JENKINS_ROOT}jenkins.io.key

sudo wget -O /etc/yum.repos.d/jenkins.repo $JENKINS_REPO

sudo rpm --import $JENKINS_KEY

sudo yum upgrade

# Add required dependencies for the jenkins package
sudo yum install java-11-openjdk
sudo yum install jenkins
sudo systemctl daemon-reload