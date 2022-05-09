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

```ssh
node index.js
```
Environment Variables:
* *METRIC_KEY* - api key for posting to the solaux account in metric.im
* *METRIC_URL* - defaults to metric.im. This can be customized for a standalone server installation
* *LOCATION* - location address for the installation. When a client configuration console is introduced this should be an id with the actual location stored in the database.
