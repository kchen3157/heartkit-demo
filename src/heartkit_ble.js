// uuid should have lowercase hex chars.
const UUID_ECG_SERVICE = '00002760-08c2-11e1-9073-0e8ac72e2000';
const UUID_WRITE_ONLY = '00002760-08c2-11e1-9073-0e8ac72e2010';
const UUID_READ_ONLY = '00002760-08c2-11e1-9073-0e8ac72e2011';
const UUID_ECG_SAMPLE = '00002760-08c2-11e1-9073-0e8ac72e2012';
const UUID_ECG_SAMPLE_MASK = '00002760-08c2-11e1-9073-0e8ac72e2013';
const UUID_ECG_RESULT = '00002760-08c2-11e1-9073-0e8ac72e2014';
const UUID_NOTIFY_ONLY = '00002760-08c2-11e1-9073-0e8ac72e2015';

const SAMPLE_DATA_LEN = 2500;

export class heartkit_ble {
  constructor() {
    this.device = null;
    this.server = null;
    this.service = null;
    this._characteristics = new Map();
    this.sampleData = new Float32Array(SAMPLE_DATA_LEN);
  }

  connect() {
    return navigator.bluetooth.requestDevice({
      filters: [{
        namePrefix: 'Cordio',
      }],
      optionalServices: [UUID_ECG_SERVICE]
    })
      .then(device => {
        this.device = device;
        return device.gatt.connect();
      })
      .then(server => {
        console.log('> Connected ' + server.connected);
        console.log('getPrimaryService...');
        this.server = server;
        return Promise.all([
          server.getPrimaryService(UUID_ECG_SERVICE).then(service => {
            return Promise.all([
              this._cacheCharacteristic(service, UUID_ECG_RESULT),
              this._cacheCharacteristic(service, UUID_ECG_SAMPLE),
              this._cacheCharacteristic(service, UUID_ECG_SAMPLE_MASK),
            ])
          }),
        ]);
      })
  }

  /* Start/Stop ECG Service Subscription*/

  startNotificationsECGService() {
    this._startNotifications(UUID_ECG_SAMPLE).then(this.handleECGSample);
    this._startNotifications(UUID_ECG_SAMPLE_MASK).then(this.handleECGSampleMask);
    this._startNotifications(UUID_ECG_RESULT).then(this.handleECGResult);
  }
  stopNotificationsECGService() {
    this._stopNotifications(UUID_ECG_SAMPLE);
    this._stopNotifications(UUID_ECG_SAMPLE_MASK);
    this._stopNotifications(UUID_ECG_RESULT);
  }


  /* Parsing data */
  parseECGSample(value) {
    console.log("parseECGSample");
    console.log(value);
  }
  parseECGSampleMask(value) {
    console.log("parseECGSampleMask");
    console.log(value);
  }
  parseECGResult(value) {
    console.log("parseECGResult");
    console.log(value);
  }


  /* Utils */

  _cacheCharacteristic(service, characteristicUuid) {
    console.log('> _cacheCharacteristic ' + service + characteristicUuid);
    return service.getCharacteristic(characteristicUuid)
      .then(characteristic => {
        console.log('> _cacheCharacteristic ' + characteristic + characteristicUuid);
        this._characteristics.set(characteristicUuid, characteristic);
      });
  }
  _readCharacteristicValue(characteristicUuid) {
    let characteristic = this._characteristics.get(characteristicUuid);
    return characteristic.readValue()
      .then(value => {
        // In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
        value = value.buffer ? value : new DataView(value);
        return value;
      });
  }
  _writeCharacteristicValue(characteristicUuid, value) {
    let characteristic = this._characteristics.get(characteristicUuid);
    return characteristic.writeValue(value);
  }
  _startNotifications(characteristicUuid) {
    function logMapElements(value, key, map) {
      console.log(`m[${key}] = ${value}`);
    }
    this._characteristics.forEach(logMapElements);
    let characteristic = this._characteristics.get(characteristicUuid);
    console.log('> _startNotifications ' + characteristicUuid + characteristic);
    // Returns characteristic to set up characteristicvaluechanged event
    // handlers in the resolved promise.
    return characteristic.startNotifications()
      .then(() => characteristic);
  }
  _stopNotifications(characteristicUuid) {
    let characteristic = this._characteristics.get(characteristicUuid);
    // Returns characteristic to remove characteristicvaluechanged event
    // handlers in the resolved promise.
    return characteristic.stopNotifications()
      .then(() => characteristic);
  }

  handleECGSample(ECGData) {
    console.log("handleECGSample");
    ECGData.addEventListener('characteristicvaluechanged', event => {
      // this.parseECGSample(event.target.value);
      console.log("parseECGSample");
      console.log(event.target.value);  
    })
  }
  
  handleECGSampleMask(ECGData) {
    console.log("handleECGSampleMask");
    ECGData.addEventListener('characteristicvaluechanged', event => {
      // this.parseECGSampleMask(event.target.value);
      console.log("parseECGSampleMask");
      console.log(event.target.value);  
    })
  }
  
  handleECGResult(ECGData) {
    console.log("handleECGResult");
    ECGData.addEventListener('characteristicvaluechanged', event => {
      // this.parseECGResult(event.target.value);
      console.log("parseECGResult");
      console.log(event.target.value);  
    })
  }
}
