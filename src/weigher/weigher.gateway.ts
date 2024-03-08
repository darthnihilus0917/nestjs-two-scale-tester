import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
import { Injectable } from '@nestjs/common';
import { WeigherService } from './weigher.service';

const WS_PORT = 3003;

@WebSocketGateway(WS_PORT)
@Injectable()
export class WeigherGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private clients: Set<WebSocket>;


    constructor(      
      private readonly weighingScaleService: WeigherService
    ) {
      this.clients = new Set();
    }


    @WebSocketServer() server: Server;


    handleConnection(client: WebSocket) {
      this.clients.add(client)
      this.server.clients.forEach(ws => {
        this.weighingScaleService.subscribeToWeightUpdates(scaleData => {          
          ws.send(scaleData);
        });


        client.on('message', (message) => {
          console.log(message)
          ws.send(message.toString('utf8'));
        });


        client.on('error', err => {
          console.error('WebSocket client error', err);
        });        


        client.on('close', () => {
          console.log('WebSocket client disconnected');
        });


      });
    }


    handleDisconnect(client: WebSocket) {
      this.clients.delete(client);
      console.log(`WebSocket client disconnected`);
    }


  // handleConnection(client: WebSocket) {    
  //   console.log('WebSocket client connected');


  //   this.weighingScaleService.subscribeToWeightUpdates(scaleData => {
  //     client.send(scaleData);
  //   });


  //   client.on('close', () => {
  //     console.log('WebSocket client disconnected');
  //   });


  //   client.on('error', err => {
  //     console.error('WebSocket client error', err);
  //   });


  //   client.on('message', (message) => {      
  //     console.log('from UI')
  //     const others = message.toString('utf8')
  //     console.log(others)
  //     client.send(others)
  //   });
  // }


  // handleDisconnect() {
  //   console.log(`WebSocket client disconnected`);
  // }
}
