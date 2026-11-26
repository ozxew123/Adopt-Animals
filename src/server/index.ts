import "dotenv/config";
import { AdopsiKuApp } from "./Application";

const port = Number(process.env.PORT) || 3001;
const app = new AdopsiKuApp();
app.start(port);
