import mqtt from 'mqtt';
import Postman from './postman.mjs';
const main = (async()=>{
    const client  = mqtt.connect('mqtt://emonpi:emonpimqtt2016@emonpi.local')
    let postman = new Postman();

    client.on('connect', async function () {
        try {
            client.subscribe('#');
            console.log('starting monitor');
        } catch(e) {
            console.error(e.message);
        }
    })

    client.on('message', async function (topic, value) {
        value = value.toString();
        let sensor = topic.match(/emon\/(.*)\//);
        if (!sensor||!sensor[1]) {
            if (process.env.PROFILE==="DEV") console.log(new Date()+": "+topic);
            return;
        }
        sensor = sensor[1];
        try {
            switch(topic) {
                case "emon/emonpi/power1":
                case "emon/emonpi/power2":
                case "emon/emonpi/vrms":
                    postman.attach(sensor,topic.slice(topic.lastIndexOf('/')+1),parseFloat(value));
                    break;
                case "emon/emonpi/power1pluspower2":
                    postman.attach(sensor,"power",parseFloat(value));
                    break;
                case "emon/emonpi/pulsecount":
                    postman.attach(sensor,topic.slice(topic.lastIndexOf('/')+1),parseInt(value));
                    break;
                case "emon/emonth5/temperature":
                case "emon/emonth6/temperature":
                case "emon/emonth7/temperature":
                case "emon/emonth8/temperature":
                    postman.attach(sensor,"temperature",parseFloat(value));
                    break;
                case "emon/emonth5/humidity":
                case "emon/emonth6/humidity":
                case "emon/emonth7/humidity":
                case "emon/emonth8/humidity":
                    postman.attach(sensor,"humidity",parseFloat(value));
                    break;
                default:
                    break;
            }
        } catch(e) {
            if (process.env.PROFILE==="DEV") console.error(e.message);
        }
    })
    process.on('SIGINT', async function() {
        console.log("Shutting down");
        await postman.drain()
        process.exit();
    });
})();


