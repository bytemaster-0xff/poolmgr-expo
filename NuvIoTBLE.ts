import { EmitterSubscription, NativeEventEmitter, NativeModules } from "react-native";
import { Peripheral } from 'react-native-ble-manager';
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
import BleManager from './services/BleManager'

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
/* RELAY Config
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
    BleManager.start({ showAlert: false })
      .then(() => {
        console.log('start was successfully called');
      })
      .catch((err: any) => {
        console.log('we got error: ', err);
      })

    console.log('constructor for NuvIoTBLE');
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
    this.subs.push(bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleUpdateValueForCharacteristic));

    console.log('subscription added, subscription count => ' + this.subs.length);
  }

  unsubscribe() {
    for (let subscription of this.subs) {
      console.log('unsubscribe: ');
      subscription.remove();
    }
  }

  isScanning = false;

  peripherals: Peripheral[] = [];

  setIsScanning(value: boolean) {
    this.isScanning = value;
  }

  async startScan() {
    //if (this.isScanning) {a
    BleManager.checkState();
    this.emitter.emit('scanning', true);
    console.log('Going to start scanning in service');
    BleManager.scan([], 5, false)
      .then((res) => {
        console.log('Scanning');
        console.log(res);
        this.setIsScanning(true);

      })
      .catch((err) => {
        console.log('error');
        console.log(err);
      });
    //}
  }

  handleUpdateValueForCharacteristic(data: any) {
    console.log('Received data from ' + data.peripheral + ' characteristic ' + data.characteristic, data.value);
  }

  handleStopScan(ble: NuvIoTBLE) {
    if (ble == null) {
      console.log('stop can ble is null');
      return;
    }

    this.emitter.emit('scanning', false);
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
    let result = await BleManager.isPeripheralConnected(peripheral.id)
    console.log('Connect Click ' + peripheral.id);
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

  async getCharacteristic(id: string, serviceId: string, characteristicId: string): Promise<string | null> {
    console.log('response from device.', id, serviceId, characteristicId);
    try {
      let result = await BleManager.read(id, serviceId, characteristicId);
      console.log('response from device.');
      return this.bin2String(result);
    }
    catch (e) {
      console.log(e);
      return null;
    }
  }

  async connectById(id: string): Promise<boolean> {
    let result = await BleManager.isPeripheralConnected(id)
    if (result) {
      console.log('already connected.');
      return true;
    }
    else {
      console.log('Attempt to connect ' + id);
      try {
        await BleManager.connect(id);
        await BleManager.retrieveServices(id);
        console.log('connected');
        return true;
      }
      catch (e) {
        console.log(e);
        return false;
      }
    }
  }

  async disconnectById(id: string): Promise<boolean> {
    let result = await BleManager.isPeripheralConnected(id)
    if (!result) {
      console.log('device is not connected.');
      return true;
    }
    else {
      console.log('Attempt to connect ' + id);
      try {
        await BleManager.disconnect(id, true);
        console.log('disconnected');
        return true;
      }
      catch (e) {
        console.log('could not disconnect');
        console.log(e);
        return false;
      }
    }
  }


  handleDiscoverPeripheral(ble: NuvIoTBLE, peripheral: Peripheral) {
    if (ble == null) {
      console.log('discover ble is null');
      return;
    }

    if (peripheral.name) {
      if (!this.peripherals.find(flt => flt.id === (peripheral.id))) {
        ble.peripherals.push(peripheral);
        console.log('added');
        ble.emitter.emit('connected', peripheral);
      }
    }
  }
}

export let ble = new NuvIoTBLE();
ble.subscribe(ble);
console.log('we created our class that will likely be reused.');