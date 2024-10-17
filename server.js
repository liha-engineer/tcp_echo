import net from 'net';
import dotenv from 'dotenv';
import { readHeader, writeHeader } from './utils.js';
import { HANDLER_ID, MAX_MESSAGE_LENGTH, TOTAL_LENGTH_SIZE } from './constants.js';
import handlers from './handlers/index.js';

dotenv.config();
const PORT = process.env.PORT;

const server = net.createServer((socket) => {
  console.log(`Client connected : ${socket.remoteAddress}: ${socket.remotePort}`);

  socket.on('data', (data) => {

    const buffer = Buffer.from(data);
    const { length, handlerId } = readHeader(data);
    console.log('length: ', length);
    console.log('handlerId: ', handlerId);

    if (length > MAX_MESSAGE_LENGTH) {
      console.error(`Error: Message length: ${length}`);
      socket.write(`Error: Message is too looooooong`);
      socket.end();
      return;
    }
    
    const handler = handlers[handlerId];

    if (!handler) {
      console.error(`Error: No handler for ID ${handlerId}`);
      socket.write(`Error: Invalid for ID ${handlerId}`);
      socket.end();
      return;
    }

    const headerSize = TOTAL_LENGTH_SIZE + HANDLER_ID;
    const message = buffer.slice(headerSize);

    console.log(`message from client: ${message}`);

    const responseMessage = handler(message);
    const responseBuffer = Buffer.from(responseMessage);

    const header = writeHeader(responseBuffer.length, handlerId);
    const packet = Buffer.concat([header, responseBuffer]);

    socket.write(packet);
  });

  socket.on('end', () => {
    console.log(`Client disconnected : ${socket.remoteAddress}: ${socket.remotePort}`);
  });

  socket.on('error', (err) => {
    console.log(`Socket error, ${err}`);
  });
});

server.listen(PORT, () => {
  console.log(`Echo server listening on port ${PORT}`);
  console.log('Server address: ', server.address());
});
