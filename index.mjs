import mqtt from 'mqtt';
import axios from 'axios';
const client  = mqtt.connect('mqtt://emonpi:emonpimqtt2016@emonpi.local')
const host = "https://metric.im";
const headers = {headers:{authorization:"bearer "+process.env.METRIC_KEY}};
let ip = "127.0.0.1"

client.on('connect', async function () {
    try {
        let result = await axios.get('https://i.geistm.com/ip');
        ip = result.data.match(/GDP.json_response\(\{ip:'(.*)'\}\)/)[1];
        client.subscribe('#');
        console.log('starting monitor for '+ip+' '+process.env.LOCATION);
    } catch(e) {
        console.error(e.message);
    }
})

client.on('message', async function (topic, value) {
    value = value.toString();
    let body = {_origin:{ip:ip,ua:"solaux/1.0 (emonpi)"}}
    body.location = process.env.LOCATION;
    let sensor = topic.match(/emon\/(.*)\//);
    if (!sensor||!sensor[1]) {
        console.log(new Date()+": "+topic);
        return;
    } else {
        body.sensor = sensor[1];
    }
    try {
        switch(topic) {
            case "emon/emonpi/power1":
            case "emon/emonpi/power2":
            case "emon/emonpi/vrms":
                body[topic.slice(topic.lastIndexOf('/')+1)]=parseFloat(value);
                break;
            case "emon/emonpi/power1pluspower2":
                body.power=parseFloat(value);
                break;
            case "emon/emonpi/pulsecount":
                body[topic.slice(topic.lastIndexOf('/')+1)]=parseInt(value);
                break;
            case "emon/emonth5/temperature":
            case "emon/emonth6/temperature":
            case "emon/emonth7/temperature":
            case "emon/emonth8/temperature":
                body.temperature=parseFloat(value);
                break;
            case "emon/emonth5/humidity":
            case "emon/emonth6/humidity":
            case "emon/emonth7/humidity":
            case "emon/emonth8/humidity":
                body.humidity=parseFloat(value);
                break;
            default:
                break;
        }
        await axios.put(host+"/ping/silent/solaux",body,headers);
    } catch(e) {
        console.error(e.message);
    }
})