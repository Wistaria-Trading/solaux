import axios from "axios";

/**
 * Class to batch attributes which are delivered in bursts.
 */
export default class Postman {
    constructor(body) {
        this.body = body;
        this.lullWait = 2000;
        this.maxWait = 10000;
        this.lullTimer = null;
        this.maxTimer = null;
        this.endpoint = "http://localhost:3000/ping/silent/solaux";
        this.endpoint = "https://metric.im/ping/silent/solaux";
        this.headers = {headers:{authorization:"bearer "+process.env.METRIC_KEY}};
        this.origin = {ua:"solaux/1.0 (emonpi)"};
        this.sensors = {};
        this.batch = [];
        this.batchSize = 10;
    }
    attach(sensor,name,value) {
        if (!this.sensors[sensor]) this.set(sensor);
        this.sensors[sensor][name] = value;
        this.resetLullTimer(sensor);
    }
    async send(sensor) {
        try {
            if (this.batch) {
                this.batch.push(this.sensors[sensor]);
                if (this.batch.length >= this.batchSize) {
                    await axios.put(this.endpoint,this.batch,this.headers);
                    this.batch = [];
                }
            }
            else await axios.put(this.endpoint,this.sensors[sensor],this.headers);
            if (process.env.PROFILE==="DEV") console.log(new Date()+": sent "+JSON.stringify(this.sensors));
            delete this.sensors[sensor];
            clearTimeout(this.lullTimer);
            clearTimeout(this.maxTimer);
        } catch(e) {
            if (process.env.PROFILE==="DEV") console.error(new Date()+": "+e.message);
        }
    }
    async drain() {
        if (!this.batch) this.batch=[];
        this.batchSize = 1000000;
        for (let sensor of Object.keys(this.sensors)) await this.send(sensor);
        if (this.batch.length > 0) await axios.put(this.endpoint,this.batch,this.headers);
    }
    set(sensor) {
        this.sensors[sensor] = {sensor:sensor,solaux_id:process.env.SOLAUX_ID,_origin:this.origin};
        this.resetMaxTimer(sensor);
    }
    resetMaxTimer(sensor) {
        clearTimeout(this.maxTimer)
        this.maxTimer = setTimeout(this.send.bind(this,sensor),this.maxWait);
    }
    resetLullTimer(sensor) {
        clearTimeout(this.lullTimer);
        this.lullTimer = setTimeout(this.send.bind(this,sensor),this.lullWait);
    }
}
