import net from 'net';
import dotenv from 'dotenv';
import { readHeader, writeHeader } from './utils.js';
import { HANDLER_ID, TOTAL_LENGTH_SIZE } from './constants.js';

dotenv.config();

const HOST = 'localhost';
const PORT = process.env.PORT;

const client = new net.Socket();

client.connect(PORT, HOST, () => {
  console.log('Connected to the server...');

  const message = 'Hello';
  const buffer = Buffer.from(message);

  const header = writeHeader(buffer.length, 10);
  const packet = Buffer.concat([header, buffer]);
  client.write(packet);
});

client.on('data', (data) => {
  const buffer = Buffer.from(data);
  
  const { length, handlerId } = readHeader(data);
  console.log('length: ', length);
  console.log('handlerId: ', handlerId);

  const headerSize = TOTAL_LENGTH_SIZE + HANDLER_ID;
  const message = buffer.slice(headerSize);

  console.log('message: ', message);
  console.log(data);
});

client.on('close', () => {
  console.log('Connection closed');
});

client.on('error', (err) => {
  console.log('Client error:', err);
});
