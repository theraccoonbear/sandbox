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

# start the Jenkins service
sudo systemctl start jenkins

JENKINS_PASS=$(sudo cat /var/lib/jenkins/secrets/initialAdminPassword)

echo -e "\n\n\n\n"
echo "ATTENTION!!!! You will need this password in the next step!\n"
echo "    JENKINS PASSWORD: $JENKINS_PASS"
echo -e "\n"
sleep 1 && echo -n "."
sleep 1 && echo -n "."
sleep 1 && echo -n "."
sleep 1 && echo -n "."

echo -e "\n\nPress any key to acknowledge you've copied the password..."
while [ true ] ; do
    read -t 3 -n 1
    if [ $? = 0 ] ; then
        exit;
    fi
done