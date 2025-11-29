import 'dotenv/config';
import express from 'express';
import { applicationConfig } from 'utils/config';

const app = express();

app.use(express.json());

app.get('/', async (req: express.Request, res: express.Response) => {
  try {
    res.send('Hello world!');
  } catch (err) {
    console.log(err);
  }
});

// Start backend server
const PORT = applicationConfig.server.port;

if (applicationConfig.server.environment !== 'test') {
  app.listen(PORT, () => {
    console.log(`Backend server is running at port ${PORT}`);
  });
}

export default app;
