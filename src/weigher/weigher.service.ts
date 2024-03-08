import { Injectable } from '@nestjs/common';
import { createConnection } from 'net';
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import { Subject } from 'rxjs';


@Injectable()
export class WeigherService {
    private weightUpdatesSubject: Subject<string> = new Subject<string>();
    private port: SerialPort;
    private parser: ReadlineParser;
   
    constructor() {
        console.log("Initiating Weighing Scale Service...");


        if (process.env.SERIAL_CONNECTION_MODE === 'true') {
          console.log("Checking Serial Port/RS232 connection...");
          // SERIAL Scale 1: Settings
          this.weighingScaleSerial(process.env.SERIAL_SCALE_01_NAME, process.env.SERIAL_SCALE_01_PORT, process.env.SERIAL_SCALE_01_BAUDRATE,
            process.env.SERIAL_SCALE_01_DATABITS, process.env.SERIAL_SCALE_01_STOPBITS, process.env.SERIAL_SCALE_01_PARITY);


          // SERIAL Scale 2: Settings
          this.weighingScaleSerial(process.env.SERIAL_SCALE_02_NAME, process.env.SERIAL_SCALE_02_PORT, process.env.SERIAL_SCALE_02_BAUDRATE,
            process.env.SERIAL_SCALE_02_DATABITS, process.env.SERIAL_SCALE_02_STOPBITS, process.env.SERIAL_SCALE_02_PARITY);


        } else {
          console.log("Checking TCP/IP connection...");
          // TCP Scale 1: TCP server and IP address
          const scaleClient1 = this.connectScaleTcp(process.env.TCP_SCALE_01_NAME, process.env.TCP_SCALE_01_IP, process.env.TCP_SCALE_01_PORT);
          this.weighingScaleTcpClient(scaleClient1, process.env.TCP_SCALE_01_NAME);
 
          // TCP Scale 2: TCP server and IP address
          const scaleClient2 = this.connectScaleTcp(process.env.TCP_SCALE_02_NAME, process.env.TCP_SCALE_02_IP, process.env.TCP_SCALE_02_PORT);
          this.weighingScaleTcpClient(scaleClient2, process.env.TCP_SCALE_02_NAME);
        }
      }
   
      subscribeToWeightUpdates(callback: (scaleData: string) => void) {
        this.weightUpdatesSubject.subscribe(callback);
      }      


      private connectScaleTcp(scaleName, scaleIpAddress, scalePort) {
        const client = createConnection({ host: scaleIpAddress, port: scalePort }, () => {
          console.log(`Connected to Weighing Scale - ${scaleName}`);
        });
        return client;
      }


      private weighingScaleTcpClient(tcpClient, scaleName) {
        tcpClient.on('data', data => {
          const weight = parseFloat(data.toString().trim());
          if (!isNaN(weight)) {
            const scaleData = {
              scaleWeight: weight,
              scale: scaleName
            }
            this.weightUpdatesSubject.next(JSON.stringify(scaleData));
            console.log(scaleData);
          }
        });
   
        tcpClient.on('end', () => {
          console.log(`Disconnected from Weighing Scale: ${scaleName}`);
        });
   
        tcpClient.on('error', err => {
            console.error(`Weighing Scale - ${scaleName} client error:`, err);
            console.log(`Weighing Scale - ${scaleName} is OFF or DISCONNECTED`);
        });
      }


      private weighingScaleSerial(scaleName, serialPort, baudRate, dataBits?, stopBits?, parity?) {
        this.port = new SerialPort({
          path: serialPort,
          baudRate: Number(baudRate),
          dataBits: dataBits,
          stopBits: stopBits,
          parity: parity
        });


        this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\n'}));


        this.port.on('open', () => {
          console.log(`${scaleName} Serial port - ${serialPort} is open`);
          this.parser.on('data', (data) => {
            const weight = data;
            console.log(`Received data: ${weight}`);
            const scaleData = {
              scaleWeight: weight,
              scale: scaleName
            }
            this.weightUpdatesSubject.next(JSON.stringify(scaleData));
            console.log(scaleData);
          });
        });


        this.port.on('error', (err) => {
          console.error(`${scaleName} Error -`, err.message);
        });
      }


}
