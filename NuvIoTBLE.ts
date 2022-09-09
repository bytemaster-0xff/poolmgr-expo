import { Platform, EmitterSubscription, NativeEventEmitter, NativeModules } from "react-native";
import { Peripheral } from 'react-native-ble-manager';
import { AsyncStorageStatic } from "react-native";
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
import BleManager, { requestMTU } from './services/BleManager'
var Buffer = require('buffer/').Buffer

export const SVC_UUID_NUVIOT = "d804b639-6ce7-4e80-9f8a-ce0f699085eb"
export const CHAR_UUID_STATE = "d804b639-6ce7-5e81-9f8a-ce0f699085eb"
/* 
 * State characteristic will encompass 
 * Read/Write and Will Notify
 *
 * xxxx => F/W SKU
 * xxx.xxx.xxx, F/W Version =>
 * xxx.xxx.xxx, H/W Version =>
 
 * (1/0) => Commissioned
 * (1/0) => BT Connectivity
 * (1/0) => WiFi Connectivity
 * (XX) => WiFiRSSI Connectivity
 * (1/0) => Cell Connectivity
 * (1/0) => CellRSSI
 * (1/0) => GPS Connectivity
 * (1/0) => GPS Satelites
 * (1/0) => Server Connectivity
 * xxx => OTA State
 * xxx => OTA Param
 */

export const SYS_STATE_DEFAULT = "BLE - GATT Example,1.0.0,*,0,0,0,0,0,0,0,0";

export const CHAR_UUID_SYS_CONFIG = "d804b639-6ce7-5e82-9f8a-ce0f699085eb"
/* 
  * Sys Config characteristic
  * Read/Write
  * xxxxx, Device Id <= =>
  * xxxxx, B64 Device Key (128 characters) =>
  * (0/1) Cell Enable <= =>
  * (0/1) WiFi Enable <= =>
  * xxxxxx WiFi SSID <= =>
  * xxxxxx WiFi Password =>
  * xxxx Ping Rate (sec)
  * xxxx Send Rate (sec)
  * (0/1) GPS Enable
  * xxxx GPS Rate (sec),
  */

export const SYS_CONFIG_DEFAULT = "?,MISC,,0,0,,,120,120,1,5";


export const CHAR_UUID_IOCONFIG = "d804b639-6ce7-5e83-9f8a-ce0f699085eb"
/* IO Config
   * 
   * 8 Slots
   * 3 Params per slot
   * x = Configuration
   * xxx = scale
   * xxx = zero
   *
   */

export const CHAR_UUID_ADC_IOCONFIG = "d804b639-6ce7-5e84-9f8a-ce0f699085eb"
/* ADC Config
   * 
   * 8 Slots
   * 3 Params per slot
   * x = Configuration
   * xxx = scale
   * xxx = zero
   *
   */

export const CHAR_UUID_IO_VALUE = "d804b639-6ce7-5e85-9f8a-ce0f699085eb"
/* IO Config
   * 
   * 8 Slots
   * 3 Params per slot
   * x = Configuration
   * xxx = scale
   * xxx = zero
   *
   */

export const CHAR_UUID_ADC_VALUE = "d804b639-6ce7-5e86-9f8a-ce0f699085eb"
/* ADC Config
   * 
   * 8 Slots
   * 3 Params per slot
   * x = Configuration
   * xxx = scale
   * xxx = zero
   *
   */

export const CHAR_UUID_RELAY = "d804b639-6ce7-5e87-9f87-ce0f699085eb"
/* RELAY Config
   * 
   * 16 slots
   * (1,0) <= => Relay State
   *
   */

const CHAR_UUID_CONSOLE = "d804b639-6ce7-5e88-9f88-ce0f699085eb"
/* Console Messages
   * 
   * 16 slots
   * (1,0) <= => Relay State
   *
   */

export class NuvIoTBLE {
  subs: EmitterSubscription[] = [];

  public emitter: NativeEventEmitter;

  constructor() {
    this.emitter = new NativeEventEmitter();
    console.log("BLE Manager Startup - Constructor");
    console.log("OS " + Platform.OS);

    if (Platform.OS !== 'web') {
      BleManager.start({ showAlert: true })
        .then(() => {
          console.log('BLE Manager Startup - Success');
        })
        .catch((err: any) => {
          console.log('BLE Manager Startup - Error - ', err);
        });
    }
  }

  subscribe(ble: NuvIoTBLE) {
    if (ble == null) {
      throw 'BLE is null, requires instance of BLE manager for subscription.'
    }

    bleManagerEmitter.removeAllListeners('BleManagerDiscoverPeripheral');
    bleManagerEmitter.removeAllListeners('BleManagerStopScan');
    bleManagerEmitter.removeAllListeners('BleManagerDisconnectPeripheral');
    bleManagerEmitter.removeAllListeners('BleManagerDidUpdateValueForCharacteristic');
    this.subs = [];
    this.subs.push(bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', (peripheral: Peripheral) => this.handleDiscoverPeripheral(ble, peripheral)));
    this.subs.push(bleManagerEmitter.addListener('BleManagerStopScan', () => this.handleStopScan(ble)));
    this.subs.push(bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', (peripheral: Peripheral) => this.handleDisconnectedPeripheral(ble, peripheral)));
    this.subs.push(bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', ({ value, peripheral, characteristic, service }) => {
      // Convert bytes array to string
      const buffer = Buffer.from(value);

      const decodedValue = buffer.toString();
      ble.emitter.emit('receive', { characteristic: characteristic, value: decodedValue });
    }));

    console.log('subscription added, subscription count => ' + this.subs.length);
  }

  unsubscribe() {
    bleManagerEmitter.removeAllListeners('BleManagerDiscoverPeripheral');
    bleManagerEmitter.removeAllListeners('BleManagerStopScan');
    bleManagerEmitter.removeAllListeners('BleManagerDisconnectPeripheral');
    bleManagerEmitter.removeAllListeners('BleManagerDidUpdateValueForCharacteristic');

    this.subs = [];
  }

  isScanning = false;

  peripherals: Peripheral[] = [];

  setIsScanning(value: boolean) {
    this.isScanning = value;
    console.log('set scanning ' + value);
    this.emitter.emit('scanning', value);
  }

  simulatedBLE(): boolean {
    return Platform.OS === 'web'
    // return true;
  }

  async listenForNotifications(deviceId: string, serviceId: string, characteristicId: string) {
    console.log('Subscribe to characteristic ' + characteristicId);
    await BleManager.startNotification(deviceId, serviceId, characteristicId);
    console.log('Subscribed to characteristic ' + characteristicId);
  }

  async startScan() {
    if (this.simulatedBLE()) {
      this.setIsScanning(true);
      let timer = window.setInterval(() => {
        let id = `${this.peripherals.length}-${new Date().getMilliseconds()}`;

        let peripheral: Peripheral = {
          id: id,
          name: `Perip - ${id}`,
          rssi: (new Date()).getSeconds(),
          advertising: {}
        }

        ble.peripherals.push(peripheral);
        console.log('added - ' + peripheral.name + ' ' + peripheral.id);
        ble.emitter.emit('connected', peripheral);
      }
        , 1000)

      window.setTimeout(() => {
        this.setIsScanning(false);
        window.clearInterval(timer);
      }, 5000);
    }
    else {
      if (!this.isScanning) {
        BleManager.checkState();
        console.log('We are starting to scan');
        BleManager.scan([SVC_UUID_NUVIOT], 5, false)
          .then((res) => {
            console.log('scanning started.');
            this.setIsScanning(true);
          })
          .catch((err) => {
            console.log('error');
            console.log(err);
          });
      }
    }
  }

  stopScan() {
    BleManager.stopScan();
  }

  handleUpdateValueForCharacteristic(data: any) {
    console.log('response');
    console.log('Received data from ' + data.peripheral + ' characteristic ' + data.characteristic, data.value);
  }

  handleStopScan(ble: NuvIoTBLE) {
    if (ble == null) {
      console.log('stop can ble is null');
      return;
    }

    ble.setIsScanning(false);
  }

  handleDisconnectedPeripheral(ble: NuvIoTBLE, data: any) {
    let peripheral = this.peripherals.find(prf => prf.id === data.peripheral.id);
    if (peripheral) {
      //peripheral.connected = false;
      //peripherals.set(peripheral.id, peripheral);
      //setList(Array.from(peripherals.values()));
    }
    console.log('Disconnected from ' + data.peripheral);
  }

  async connect(peripheral: Peripheral) {
    if (this.simulatedBLE()) {

    }
    else {
      let result = await BleManager.isPeripheralConnected(peripheral.id)
      console.log('Attempt to connect ' + peripheral.id);
      if (result) {
        console.log('already connected.');
      }
      else {
        console.log('Attempt to connect ' + peripheral.id);
        try {
          await BleManager.connect(peripheral.id)
          console.log('connected');
        }
        catch (e) {
          console.log(e);
        }
      }
    }
  }

  bin2String(array: []) {
    var result = "";
    for (const char of array) {
      result += String.fromCharCode(char);
    }
    return result;
  }

  async getServices(id: string): Promise<boolean> {
    try {
      await this.connectById(id);
      return true;
    }
    catch (e) {
      return false;
    }
  }

  string2Bin(str: string): number[] {
    const bytes = [];
    for (let ii = 0; ii < str.length; ii++) {
      const code = str.charCodeAt(ii); // x00-xFFFF
      bytes.push(code & 255); // low, high
    }
    return bytes;
  }

  async getCharacteristic(id: string, serviceId: string, characteristicId: string): Promise<string | null> {
    if (this.simulatedBLE()) {
      return "";
    }
    else {
      try {
        let result = await BleManager.read(id, serviceId, characteristicId);
        console.log("BLEManager__readCharacteristic: success, id = " + id + ' srcvid = ' + serviceId + ', charid=' + characteristicId);
        let responseStr = this.bin2String(result);
        console.log("BLEManager__readCharacteristic: failure, id = " + id + ' srcvid = ' + serviceId + ', charid=' + characteristicId);
        return responseStr
      }
      catch (e) {
        console.log('ERROR GET response', e);
        return null;
      }
    }
  }

  async writeCharacteristic(id: string, serviceId: string, characteristicId: string, value: string): Promise<boolean> {
    try {
      let buffer = this.string2Bin(value);
      await BleManager.write(id, serviceId, characteristicId, buffer, 255);
      console.log("BLEManager__writeCharacteristic: success, id = " + id + ' srcvid = ' + serviceId + ', charid=' + characteristicId);
      return true;
    }
    catch (e) {
      console.log("BLEManager__writeCharacteristic: failure, id = " + id + ' srcvid = ' + serviceId + ', charid=' + characteristicId);
      return false;
    }
  }

  async connectById(id: string, characteristicId: string | undefined = undefined): Promise<boolean> {
    let retryCount = 5;
    while (true) {
      if (this.simulatedBLE()) {
        return true;
      }
      else {
        let result = await BleManager.isPeripheralConnected(id)
        if (result) {
          console.log('BLEManager__connectById: already connected, id=' + id);
          let resetResult = await BleManager.requestMTU(id, 512);
          return true;
        }
        else {
          try {
            console.log('BLEManager__connectById: Connect, id=' + id);
            await BleManager.connect(id);

            let services = await BleManager.retrieveServices(id);
            await BleManager.requestMTU(id, 512);

            if (characteristicId) {
              console.log('BLEManager__connectById: Connected, id=' + id);
              for (let chr of services.characteristics) {
                if (chr.characteristic == characteristicId) {
                  console.log('BLEManager__connectById: Connected to NuvIoT Device, id=' + id);
                  return true;
                }
              }

              console.log('BLEManager__connectById: Not NuvIoT Device, id=' + id);
              await this.disconnectById(id);
              return false;
            }

            console.log('BLEManager__connectById: Connected, not checking for service, id=' + id);            
            return true;
          }
          catch (e) {
            console.log('BLEManager__connectById: Error - ' + e + ' id=' + id + ' retry count ' + retryCount);
            if(retryCount-- == 0)
              return false;
          }
        }
      }
    }

    return false;
  }

  async disconnectById(id: string): Promise<boolean> {
    if (this.simulatedBLE()) {
      return true;
    }
    else {
      let result = await BleManager.isPeripheralConnected(id)
      if (!result) {
        console.log("BLEManager__disconnectById: not connected.");
        return true;
      }
      else {
        try {
          await BleManager.disconnect(id, true);
          console.log("BLEManager__disconnectById: success, id = " + id);
          return true;
        }
        catch (e) {
          console.log("BLEManager__disconnectById: error, id = " + id + "," + e);
          return false;
        }
      }
    }
  }

  handleDiscoverPeripheral(ble: NuvIoTBLE, peripheral: Peripheral) {
    if (ble == null) {
      console.log('discover ble is null');
      return;
    }

    if (peripheral.name) {
      if (!ble.peripherals.find(flt => flt.id === (peripheral.id))) {
        ble.peripherals.push(peripheral);
        console.log('added -> ' + peripheral.name + ' - ' + peripheral.id);
        ble.emitter.emit('connected', peripheral);
      }
    }
  }
}

export let ble = new NuvIoTBLE();
ble.subscribe(ble);
