import { IRoot, Root } from "./models/root";
import * as Constants from './constants';
import { IHeartKitResult } from "./models/root";
import { IHeartKitState } from "./models/root";

// uuid should have lowercase hex chars.
const UUID_ECG_SERVICE = '00002760-08c2-11e1-9073-0e8ac72e2000';
const UUID_WRITE_ONLY = '00002760-08c2-11e1-9073-0e8ac72e2010';
const UUID_READ_ONLY = '00002760-08c2-11e1-9073-0e8ac72e2011';
const UUID_ECG_SAMPLE = '00002760-08c2-11e1-9073-0e8ac72e2012';
const UUID_ECG_SAMPLE_MASK = '00002760-08c2-11e1-9073-0e8ac72e2013';
const UUID_ECG_RESULT = '00002760-08c2-11e1-9073-0e8ac72e2014';
const UUID_NOTIFY_ONLY = '00002760-08c2-11e1-9073-0e8ac72e2015';

const SAMPLE_DATA_LEN = 2500;
class ECGSensor {
  constructor() {
    this.device = null;
    this.server = null;
    this.service = null;
    this._characteristics = new Map();
    this.sampleData = new Float32Array(SAMPLE_DATA_LEN);
    this.root = null;
  }

  connect(root: IRoot) {
    // save store's root
    this.root = root;
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
    this._startNotifications(UUID_ECG_SAMPLE).then(handleECGSample);
    this._startNotifications(UUID_ECG_SAMPLE_MASK).then(handleECGSampleMask);
    this._startNotifications(UUID_ECG_RESULT).then(handleECGResult);
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
}

export const ecgSensorInstance = new ECGSensor();

function handleECGSample(ECGData) {
  console.log("handleECGSample");
  ECGData.addEventListener('characteristicvaluechanged', event => {
    ecgSensorInstance.parseECGSample(event.target.value);
    // call model's action
    // ecgSensorInstance.root.setDataId(1234);
  })
}

function handleECGSampleMask(ECGData) {
  console.log("handleECGSampleMask");
  ECGData.addEventListener('characteristicvaluechanged', event => {
    ecgSensorInstance.parseECGSampleMask(event.target.value);
  })
}

function handleECGResult(ECGData) {
  console.log("handleECGResult");
  ECGData.addEventListener('characteristicvaluechanged', event => {
    ecgSensorInstance.parseECGResult(event.target.value);
  
    const num_samples = 2500;
    const offset = Math.random() * 200;
    const amp = Math.random() * 4 + 3; // Random value between 3 and 7
    const data = Array.from({ length: num_samples }, (_, i) => {
      return amp * Math.cos((i + offset) * (2 * Math.PI) / 250);
    });

    const seg_mask = Array.from({ length: 10 }, () => {
      return [0, 1, 0, 2, 0, 3, 0];
    }).flat();

    const AppState = ["IDLE_STATE", "COLLECT_STATE", "PREPROCESS_STATE", "INFERENCE_STATE", "DISPLAY_STATE"]; // Assuming AppState is an enum-like structure

    function getRandomAppState() {
      return AppState[Math.floor(Math.random() * AppState.length)];
    }

    const results = {
      heartRate: Math.floor(Math.random() * 101) + 20, // Random value between 20 and 120
      heartRhythm: Math.floor(Math.random() * 3), // Random value between 0 and 2
      numNormBeats: Math.floor(Math.random() * 11), // Random value between 0 and 10
      numPacBeats: Math.floor(Math.random() * 7), // Random value between 0 and 6
      numPvcBeats: Math.floor(Math.random() * 4), // Random value between 0 and 3
      arrhythmia: Math.random() < 0.5, // Random true/false value
    };

    const state = {
      dataId: Math.floor(Math.random() * 101), // Random value between 0 and 100
      // appState: getRandomAppState(),
      appState: 'DISPLAY_STATE',
      data: data,
      segMask: seg_mask,
      results: results,
    };


//     const validAppStateValues = ['DISPLAY_STATE', 'IDLE_STATE', /* ... */];

//     const heartKitStateObject = {
//     dataId: 61,
//     appState: 'DISPLAY_STATE',
//     data: [0.10285352224391943, 0.19738205969205094, /* ... */],
//     segMask: [0, 1, 0, 2, 0, 3, 0, /* ... */],
//     results: {
//       heartRate: 70,
//       heartRhythm: 1,
//       numNormBeats: 10,
//       numPacBeats: 5,
//       numPvcBeats: 3,
//       arrhythmia: false,
//     },
// };

    ecgSensorInstance.root.setState(state);
    
    // Assuming set_global_state is a function to set the global state
    // set_global_state(state);
  })
}

