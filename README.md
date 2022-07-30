# Solaux

The solaux client is a lightweight data pipe that listens for MQTT
event traffic and posts normalized events to Metric IM for analysis
and triggers.

Each even emanates from a sensor. Currently we support emonpi, which
reports power usage, and emonth which reports temperature and humidity
from up to four on site devices. https://openenergymonitor.org/. This
will be expanded as new sensors are introduced.

## Runtime

The Solaux client listens for traffic on the standard MQTT port (using
the npm package mqtt.) The process can be run anywhere on the local
network that hosts an EmonPI device. It is convenient to run on a dev
machine for debugging, but is intended to be installed on the primary
sensor device (emonpi or its successor.)

The installation could be built into the device image, but it will need
to be customized at installation with an address or customer ID that 
distinguishes it from other installations.

## Security

Data should be encrypted and signed with a key generated during personalization
which needs to take place at installation. This is not yet implemented.

## Code Structure

The app is written as a nodejs process to be run as a systemctl module. It
might be convenient to port to python before too long as the EmonPI ships
with Python but not NodeJS.

## Installation

Clone solaux client to home directory. Install node and npm. Install solaux into sytemctl
```ssh
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt install npm
cd /etc/systemd/system/
sudo ln -s /home/pi/solaux/solaux.service solaux.service
sudo systemctl start solaux.service 
sudo systemctl status solaux.service 
sudo systemctl enable solaux.service 
```

Environment Variables:
* *METRIC_KEY* - api key for posting to the solaux account in metric.im
* *SOLAUX_ID* - Account Id registered for this device. The account id is defined in the solaux console and identifies the location and owner.

It's helpful to simply run the solaux node app before starting the service. This way the results show up in the console directly. Once it's running, kill it and start the backgroun service so you can log out.
```
cd ~/solaux
node -r dotenv/config solaux.mjs
```
Please keep and add notes to the installation procedure as it's only been done once.
