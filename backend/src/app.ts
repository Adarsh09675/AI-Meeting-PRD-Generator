import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

// register routers
import transcriptRoutes from './routes/transcriptRoutes';
import prdRoutes from './routes/prdRoutes';
import firefliesRoutes from './routes/firefliesRoutes';

app.use('/api/transcripts', transcriptRoutes);
app.use('/api/prd', prdRoutes);
app.use('/api/fireflies', firefliesRoutes);


export default app;