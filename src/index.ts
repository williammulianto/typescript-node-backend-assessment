import 'dotenv/config';
import express from 'express';

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
const PORT = process.env.PORT || 8800;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Backend server is running at port ${PORT}`);
  });
}

export default app;
